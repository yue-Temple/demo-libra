import { AppDataSource } from '../data-source';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
// エンティティ
import { User } from '../entity/User';
import { Menu } from '../entity/Menu';
import { RefreshToken } from '../entity/RefreshToken';
// 型定義
import { Role } from '../backtype';
// 関数
import { generateRandomUserId } from '../utils/uuid';
import {
  AuthTokenService,
  generateAccessToken,
  generateRefreshToken,
} from './AuthTokenService';
import { UserTemporary } from '../entity/UserTemporary';
import { sendVerificationEmail } from '../utils/sendAuthEmail';

const tokenService = new AuthTokenService();

export class AuthMailService {
  /**
   * メールアドレス＋パスワードでの仮登録
   * @param email
   * @returns 認証コードの送信結果
   */
  async registerWithEmail(email: string): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const temporaryUserRepository =
        AppDataSource.getRepository(UserTemporary);

      // 既に登録されているか確認
      const existingUser = await userRepository.findOne({
        where: { user_email: email },
      });
      if (existingUser) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      // 既に仮登録されている場合は削除
      const tempoexistingUser = await temporaryUserRepository.findOne({
        where: { email },
      });
      if (tempoexistingUser) {
        await temporaryUserRepository.remove(tempoexistingUser);
      }

      // 仮登録レコードを作成
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分

      const temporaryUser = new UserTemporary();
      temporaryUser.email = email;
      temporaryUser.verification_code = verificationCode;
      temporaryUser.expires_at = expiresAt;

      await temporaryUserRepository.save(temporaryUser);

      // 認証コード付きメールを送信
      await sendVerificationEmail(email, verificationCode);

      console.log('仮登録成功。認証コード(有効期限:30分)を送信しました。');
    } catch (error) {
      console.error('仮登録に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 認証コードの検証と本登録
   * @param email
   * @param password
   * @param code
   * @param deviceId
   * @param res
   * @returns { accessToken }
   */
  async verifyAndCompleteRegistration(
    email: string,
    password: string,
    code: string,
    deviceId: string,
    res: Response
  ): Promise<{ accessToken: string }> {
    try {
      const temporaryUserRepository =
        AppDataSource.getRepository(UserTemporary);
      const userRepository = AppDataSource.getRepository(User);
      const menuRepository = AppDataSource.getRepository(Menu);
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

      // 仮登録レコードを取得
      const temporaryUser = await temporaryUserRepository.findOne({
        where: { email },
      });
      if (!temporaryUser) {
        throw new Error('仮登録レコードが見つかりません');
      }

      // 認証コードの有効期限を確認
      if (new Date() > temporaryUser.expires_at) {
        throw new Error('認証コードの有効期限が切れています');
      }

      // 認証コードを検証
      if (temporaryUser.verification_code !== code) {
        throw new Error('認証コードが一致しません');
      }

      // 本登録レコードを作成
      const hashedPassword = await bcrypt.hash(password, 10);
      const userid = generateRandomUserId();

      const newUser = new User();
      newUser.user_id = userid;
      newUser.user_email = email;
      newUser.password = hashedPassword;
      newUser.user_role = Role.NormalUser;
      newUser.last_login = new Date();
      newUser.is_email_verified = true; // メール認証済み
      await userRepository.save(newUser);

      // メニューテーブルの生成
      const newMenu = new Menu();
      newMenu.user_number = newUser.user_number; // 外部キーを設定
      await menuRepository.save(newMenu);

      // JWT トークンを生成
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser.user_id);

      // リフレッシュトークンをデータベースに保存
      await refreshTokenRepository.save({
        token: refreshToken,
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
        user: newUser,
        device_id: deviceId,
      });

      // リフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      // 仮登録レコードを削除
      await temporaryUserRepository.delete({ id: temporaryUser.id });

      console.log('本登録が完了しました。');
      return { accessToken };
    } catch (error) {
      console.error('本登録に失敗しました:', error);
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
    const existingUser = await userRepository.findOne({
      where: { user_email: email },
    });

    // ユーザーが存在しない、またはパスワードが null の場合
    if (!existingUser || !existingUser.password) {
      throw new Error('メールアドレスもしくはパスワードが間違っています');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error('メールアドレスもしくはパスワードが間違っています');
    }

    // 最終ログインカラムを更新
    await userRepository.update(existingUser.user_id, {
      last_login: new Date(),
    });

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
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken };
    }

    // 2⃣リフレッシュトークンがある場合　（別デバイスログインなど？）
    if (existingToken) {
      // リフレッシュトークンを渡してアクセストークンを再発行
      const { accessToken, refreshToken } =
        await tokenService.refreshAccessToken(existingToken.token); //期限検証,必要に応じて更新

      console.log('koko');
      // 新しいリフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken };
    }

    // ここには到達しないが、型チェックのためにデフォルトの戻り値を設定
    throw new Error('予期せぬエラーが発生しました');
  }
  catch(error: any) {
    console.error('ログインに失敗しました:', error);
    throw error;
  }
}
