import { AppDataSource } from '../data-source';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secretKey, tokenExpiry } from '../app';
import nodemailer from 'nodemailer';
// エンティティ
import { User } from '../entity/User';
import { Menu } from '../entity/Menu';
// 型定義
import { Role } from '../backtype';
// 関数
import { generateRandomUserId, generateverifyToken } from './alllogic';

export class AuthMailService {
  /**
   * メールアドレス＋パスワードでの登録
   * @param email
   * @param password
   * @returns
   */
  async registerWithEmail(email: string, password: string): Promise<string> {
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
    // データベースに保存
    await userRepository.save(newUser);

    // Menuテーブルに新しいレコードを作成
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

    // JWTトークンを生成
    const token = jwt.sign(
      {
        user_id: newUser.user_id,
        user_email: newUser.user_email,
        user_number: newUser.user_number,
        user_role: newUser.user_role,
      },
      secretKey,
      { expiresIn: tokenExpiry }
    );
    return token; // JWTトークンを返す
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
  }

  /**
   * メールアドレス＋パスワードでのログイン
   * @param email
   * @param password
   * @returns
   */
  async loginWithEmail(email: string, password: string): Promise<string> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { user_email: email } });

    // ユーザーが存在しない、またはパスワードが null の場合
    if (!user || !user.password) {
      throw new Error('メールアドレスもしくはパスワードが間違っています');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('パスワードが間違っています');
    }

    // JWTトークンを生成
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_number: user.user_number,
        user_role: user.user_role,
      },
      secretKey,
      { expiresIn: tokenExpiry }
    );

    return token;
  }
}

export class AuthLogoutService {
  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    console.log('ログアウトしました');
    // 必要に応じてセッションクリアやトークン無効化の処理を追加
  }
}
