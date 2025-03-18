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
    // SendGridのSMTPサーバー設定
    const transporter = nodemailer.createTransport({
      service: 'SendGrid', // SendGridを指定
      host: 'smtp.sendgrid.net', // SendGridのSMTPサーバー
      port: 587, // TLS用のポート
      secure: false, // true for 465 (SSL), false for other ports
      auth: {
        user: 'apikey', // SendGrid APIキー用のユーザー名
        pass: process.env.SENDGRID_API_KEY, // SendGrid APIキーを環境変数から取得
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM, // 実際の送信元メールアドレス
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
