import { AppDataSource } from '../data-source';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { Response } from 'express';
// エンティティ
import { User } from '../entity/User';
import { Menu } from '../entity/Menu';
import { RefreshToken } from '../entity/RefreshToken';
// 型定義
import { Role } from '../backtype';
// 関数
import { generateRandomUserId, generateverifyToken } from '../utils/uuid';
import { AuthTokenService, generateAccessToken, generateRefreshToken } from './AuthTokenService';

const tokenService = new AuthTokenService();

export class AuthMailService {
  /**
   * メールアドレス＋パスワードでの登録
   * @param email
   * @param password
   * @param deviceId - デバイスID
   * @param res
   * @returns
   */
  async registerWithEmail(
    email: string,
    password: string,
    deviceId: string,
    res: Response
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      // 既に登録されているか確認
      const existingUser = await userRepository.findOne({
        where: { user_email: email },
      });
      if (existingUser) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      // ユーザーIDとパスワードを生成
      const userid = generateRandomUserId();
      const hashedPassword = await bcrypt.hash(password, 10);

      // 新しいユーザーを作成
      const newUser = new User();
      newUser.user_id = userid;
      newUser.user_email = email;
      newUser.password = hashedPassword;
      newUser.user_role = Role.NormalUser;
      newUser.is_email_verified = false; // 初期状態では未認証
      await userRepository.save(newUser);

      // メニューテーブルの生成
      const menuRepository = AppDataSource.getRepository(Menu);
      const newMenu = new Menu();
      newMenu.user_number = newUser.user_number; // 外部キーを設定
      await menuRepository.save(newMenu);

      // メール検証用トークンを生成
      const verificationToken = generateverifyToken();
      newUser.email_verification_token = verificationToken;
      newUser.email_verification_token_expires = new Date(
        Date.now() + 24 * 60 * 60 * 1000 // 24時間有効
      );

      // 認証リンク付きメールを送信
      await this.sendVerificationEmail(email, verificationToken);
      console.log(
        'メールアドレス登録成功。認証リンク(有効期限:24時間)を送信しました。'
      );

      // JWT トークンを生成
      const accessToken = generateAccessToken(newUser);

      // リフレッシュトークンを生成
      const refreshToken = generateRefreshToken(newUser.user_id);

      // リフレッシュトークンをデータベースに保存（デバイスIDを含む）
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      await refreshTokenRepository.save({
        token: refreshToken,
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
        user: newUser, // リレーションを設定
        device_id: deviceId, // デバイスIDを保存
      });

      // リフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // JavaScriptからアクセス不可
        secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none', // 開発環境ではクロスサイトを許可
        path: '/', // すべてのパスで有効
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('登録に失敗しました:', error);
      throw error;
    }
  }

  /**
   * メールアドレス＋パスワードでのログイン
   * @param email
   * @param password
   * @param deviceId
   * @param res
   * @returns
   */
  async loginWithEmail(
    email: string,
    password: string,
    deviceId: string,
    res: Response
  ): Promise<{ accessToken: string }> {
    const userRepository = AppDataSource.getRepository(User);
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // ユーザーを検索
    const existingUser = await userRepository.findOne({ where: { user_email: email } });

    // ユーザーが存在しない、またはパスワードが null の場合
    if (!existingUser || !existingUser.password) {
      throw new Error('メールアドレスもしくはパスワードが間違っています');
    }
    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new Error('パスワードが間違っています');
    }

    // 既存のリフレッシュトークンを確認
    const existingToken = await refreshTokenRepository.findOne({
      where: { user: { user_id: existingUser.user_id }, device_id: deviceId },
    });

    // 1⃣リフレッシュトークンがない場合
    if (!existingToken) {
      console.log('ログイン：リフレッシュトークンを作成');
      const accessToken = generateAccessToken(existingUser); // アクセストークンを生成
      const refreshToken = generateRefreshToken(existingUser.user_id); // リフレッシュトークンを生成

      // 新しいリフレッシュトークンをデータベースに保存
      const newRefreshToken = refreshTokenRepository.create({
        token: refreshToken,
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
        user: existingUser,
        device_id: deviceId,
      });
      await refreshTokenRepository.save(newRefreshToken);

      // リフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // JavaScriptからアクセス不可
        secure: true,
        sameSite: 'lax',
        path: '/', // すべてのパスで有効
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken }; 
    }

    // 2⃣リフレッシュトークンがある場合　※たぶんいらない（ログアウト時リフレッシュトークン削除する為）
    if (existingToken) {
      // リフレッシュトークンを渡してアクセストークンを再発行
      const { accessToken, refreshToken } =
        await tokenService.refreshAccessToken(existingToken.token); //期限検証,必要に応じて更新

      // 新しいリフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken }; 
    }

   // ここには到達しないが、型チェックのためにデフォルトの戻り値を設定
   throw new Error('予期せぬエラーが発生しました');
  } catch (error: any) {
    console.error('Google ログインに失敗しました:', error);
    throw error;
  }

    /**
   * 認証リンク付きメールを送信するロジック
   * @param email
   * @param token
   */
    private async sendVerificationEmail(
      email: string,
      token: string
    ): Promise<void> {
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Gmailを使用する場合
        auth: {
          user: process.env.EMAIL_USER, // 環境変数から送信元メールアドレス
          pass: process.env.EMAIL_PASS, // 環境変数からパスワード
        },
      });
  
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'メールアドレスの認証',
        text: `以下のリンクをクリックしてメールアドレスを認証してください: ${verificationUrl}`,
        html: `<p>以下のリンクをクリックしてメールアドレスを認証してください:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
      };
  
      await transporter.sendMail(mailOptions);
    };
};







