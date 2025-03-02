import nodemailer from 'nodemailer';

/**
 * 認証コード付きメールを送信する関数
 * @param email - 宛先メールアドレス
 * @param verificationCode - 認証コード
 */
export async function sendVerificationEmail(
  email: string,
  verificationCode: string
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com', // GmailのSMTPサーバー
      port: 587, // TLS用のポート
      secure: false, // true for 465 (SSL), false for other ports
      auth: {
        user: process.env.EMAIL_USER, // 環境変数から取得
        pass: process.env.EMAIL_PASS, // 環境変数から取得
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '認証コードのご案内',
      text: `認証コードは ${verificationCode} です。15分以内に入力してください。`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`認証コードを ${email} に送信しました。`);
  } catch (error) {
    console.error('メール送信中にエラーが発生しました:', error);
    throw new Error('メール送信に失敗しました');
  }
}
