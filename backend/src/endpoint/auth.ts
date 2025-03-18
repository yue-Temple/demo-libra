import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthTokenService, logout } from '../services/AuthTokenService';
import { deleteFromR2 } from '../services/R2Service';
import { saveUser } from '../services/AuthUserService';
import { AuthPassResetService } from '../services/AuthPassResetService';
import { deleteUseraccount } from '../services/UserService';
import { authenticateToken } from '../middleware/authMiddleware';

const authTokenService = new AuthTokenService();

export const passwordResetRequestHandler = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return reply.status(400).send({ message: 'メールアドレスは必須です。' });
    }
    await AuthPassResetService.ResetRequest(email);
    reply.status(200).send({ message: 'OTPを送信しました。' });
  } catch (error) {
    console.error(
      'パスワードリセットリクエスト中にエラーが発生しました:',
      error
    );
    reply.status(500).send({ message: (error as Error).message });
  }
};

export const passwordResetVerifyHandler = async (
  req: FastifyRequest<{ Body: { email: string; code: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return reply
        .status(400)
        .send({ message: 'メールアドレスとOTPは必須です。' });
    }
    await AuthPassResetService.otpVerify(email, code);
    reply.status(200).send({ message: 'OTPの認証に成功しました。' });
  } catch (error) {
    console.error('OTP認証中にエラーが発生しました:', error);
    reply.status(500).send({ message: (error as Error).message });
  }
};

export const passwordResetSetHandler = async (
  req: FastifyRequest<{ Body: { email: string; newpassword: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email, newpassword } = req.body;
    if (!email || !newpassword) {
      return reply
        .status(400)
        .send({ message: 'メールアドレスと新しいパスワードは必須です。' });
    }
    await AuthPassResetService.passwordSet(email, newpassword);
    reply.status(200).send({ message: 'パスワードの更新に成功しました。' });
  } catch (error) {
    console.error('パスワード更新中にエラーが発生しました:', error);
    reply.status(500).send({ message: (error as Error).message });
  }
};

export const logoutHandler = async (
  req: FastifyRequest<{ Body: { refreshToken: string } }>,
  reply: FastifyReply
) => {
  const { refreshToken } = req.body;
  console.log('ログアウト：リフレッシュトークンの削除');
  try {
    await logout(refreshToken);
    reply.clearCookie('refreshToken', { path: '/' });
    reply.status(200).send({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('ログアウト処理中にエラーが発生しました:', error);
    reply.status(500).send({ message: 'ログアウトに失敗しました' });
  }
};

export const userSaveHandler = async (
  req: FastifyRequest<{
    Body: {
      user_id: string;
      user_name: string;
      user_icon: string;
      delete_iconurl: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { user_id, user_name, user_icon, delete_iconurl } = req.body;
    console.log(user_id, user_name, user_icon);
    const newtoken = await saveUser(user_id, user_name, user_icon);
    if (delete_iconurl) {
      const old_object_Key = delete_iconurl.replace(
        `${process.env.CDN_DOMAIN}`,
        ''
      );
      deleteFromR2(old_object_Key);
    }
    reply.status(200).send({
      message: 'ユーザーデータ保存成功',
      newtoken,
    });
  } catch (error) {
    reply.status(500).send({
      message: 'ユーザーデータ保存に失敗しました',
      error: (error as Error).message,
    });
  }
};

export const userDeleteHandler = async (
  req: FastifyRequest<{ Body: { user_id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { user_id } = req.body;
    await deleteUseraccount(user_id);
    reply.clearCookie('refreshToken', { path: '/' });
    reply.status(200).send({ message: 'アカウント削除が完了しました' });
  } catch (error) {
    console.error('アカウント削除中にエラーが発生しました:', error);
    if (error instanceof Error) {
      reply.status(500).send({ message: error.message });
    } else {
      reply
        .status(500)
        .send({ message: 'アカウント削除中に不明なエラーが発生しました' });
    }
  }
};

export const refreshTokenHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // クッキーからリフレッシュトークンを取得
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return reply
        .status(400)
        .send({ error: 'リフレッシュトークンが提供されていません' });
    }
    // トークンを使ってアクセストークンを更新
    const { accessToken, refreshToken: newRefreshToken } =
      await authTokenService.refreshAccessToken(refreshToken);
    // 新しいアクセストークンとリフレッシュトークンを返す
    return reply.send({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('アクセストークンの再発行に失敗しました:', error);
    if (error instanceof Error) {
      if (error.message === '無効なリフレッシュトークンです') {
        return reply
          .status(401)
          .send({ error: '無効なリフレッシュトークンです' });
      }
    }
    return reply.status(500).send({ error: 'サーバーエラーが発生しました' });
  }
};

export default async function (app: FastifyInstance) {
    app.post<{
      Body: { email: string };
    }>('/password-reset/request', passwordResetRequestHandler);
  
    app.post<{
      Body: { email: string; code: string };
    }>('/password-reset/verify', passwordResetVerifyHandler);
  
    app.post<{
      Body: { email: string; newpassword: string };
    }>('/password-reset/set', passwordResetSetHandler);
  
    app.post<{
      Body: { refreshToken: string };
    }>('/logout', logoutHandler);
  
    app.post<{
      Body: {
        user_id: string;
        user_name: string;
        user_icon: string;
        delete_iconurl: string;
      };
    }>('/user-save', { preHandler: authenticateToken }, userSaveHandler);
  
    app.delete<{
      Body: { user_id: string };
    }>('/user-delete', { preHandler: authenticateToken }, userDeleteHandler);
  
    app.post<{
      Body: { refreshToken: string };
    }>('/refresh-token', refreshTokenHandler);
  }
