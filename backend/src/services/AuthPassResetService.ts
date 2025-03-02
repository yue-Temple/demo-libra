import { AppDataSource } from '../data-source';
import bcrypt from 'bcryptjs';
import { User } from '../entity/User';
import { UserPasswordReset } from '../entity/UserPasswordReset';
import { sendVerificationEmail } from '../utils/sendAuthEmail';

export class AuthPassResetService {
  /**
   * OTPの発行
   * @param email ユーザーのメールアドレス
   * @returns 認証コードの送信結果
   */
  static async ResetRequest(email: string): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const passwordResetRepository =
        AppDataSource.getRepository(UserPasswordReset);

      // 既に登録されているか確認
      const existingUser = await userRepository.findOne({
        where: { user_email: email },
      });
      if (!existingUser) {
        throw new Error('登録されていないメールアドレスです');
      }

      // OTPを生成
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString(); // 6桁のランダムな数字
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分後の有効期限

      // OTPをデータベースに保存
      const passwordReset = new UserPasswordReset();
      passwordReset.token = verificationCode;
      passwordReset.expires_at = expiresAt;
      passwordReset.user_id = existingUser.user_id;
      await passwordResetRepository.save(passwordReset);

      // 認証コード付きメールを送信
      await sendVerificationEmail(email, verificationCode);

      console.log('OTPを送信しました。');
    } catch (error) {
      console.error('OTPの発行に失敗しました:', error);
      throw error;
    }
  }

  /**
   * OTPの認証
   * @param email ユーザーのメールアドレス
   * @param code ユーザーが入力したOTP
   * @returns 認証結果
   */
  static async otpVerify(email: string, code: string): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const passwordResetRepository =
        AppDataSource.getRepository(UserPasswordReset);

      // 既に登録されているか確認
      const existingUser = await userRepository.findOne({
        where: { user_email: email },
      });
      if (!existingUser) {
        throw new Error('登録されていないメールアドレスです');
      }

      // OTPを検証
      const passwordReset = await passwordResetRepository.findOne({
        where: { user_id: existingUser.user_id, token: code },
      });
      if (!passwordReset) {
        throw new Error('無効なワンタイムパスワードです');
      }

      // 有効期限を確認
      if (passwordReset.expires_at < new Date()) {
        throw new Error('ワンタイムパスワードの有効期限が切れています');
      }

      console.log('認証に成功しました。');
    } catch (error) {
      console.error('OTP認証に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 新しいパスワードの設定
   * @param email ユーザーのメールアドレス
   * @param newPassword 新しいパスワード
   * @returns パスワード更新結果
   */
  static async passwordSet(email: string, newPassword: string): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const passwordResetRepository =
        AppDataSource.getRepository(UserPasswordReset);

      // 既に登録されているか確認
      const existingUser = await userRepository.findOne({
        where: { user_email: email },
      });
      if (!existingUser) {
        throw new Error('登録されていないメールアドレスです');
      }

      // 新しいパスワードをハッシュ化
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // パスワードを更新
      existingUser.password = hashedPassword;
      await userRepository.save(existingUser);

      // 使用されたOTPを削除
      await passwordResetRepository.delete({ user_id: existingUser.user_id });

      console.log('パスワードの更新に成功しました。');
    } catch (error) {
      console.error('パスワードの更新に失敗しました:', error);
      throw error;
    }
  }
}
