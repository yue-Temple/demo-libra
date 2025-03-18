import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { AuthMailService } from '../services/AuthMailService';
import { AuthGoogleService } from '../services/AuthGoogleService';

const mailService = new AuthMailService();
const googleService = new AuthGoogleService();

const FRONTEND_URL = process.env.FRONTEND_URL;

export const registerWithEmailHandler = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body;
    await mailService.registerWithEmail(email);
    reply.status(200).send({
      message: '仮登録が完了しました。認証コードを確認してください。',
    });
  } catch (error) {
    if (
      (error as Error).message === 'このメールアドレスは既に登録されています'
    ) {
      reply.status(409).send({ error: (error as Error).message });
    } else {
      reply.status(500).send({ error: 'サーバーエラーが発生しました' });
    }
  }
};

export const verifyAndCompleteRegistrationHandler = async (
  req: FastifyRequest<{
    Body: { email: string; code: string; password: string; deviceId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { email, code, password, deviceId } = req.body;
    const tokens = await mailService.verifyAndCompleteRegistration(
      email,
      password,
      code,
      deviceId
    );
    reply.status(201).send({
      message: '本登録が完了しました。',
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    reply.status(400).send({ error: (error as Error).message });
  }
};

export const googleRegisterCallbackHandler = async (
  req: FastifyRequest<{ Querystring: { code: string; state: string } }>,
  reply: FastifyReply
) => {
  try {
    const { code, state: receivedState } = req.query;
    const [state, deviceId] = receivedState.split(':');

    if (!code || !state || !deviceId) {
      return reply
        .status(400)
        .send({ message: '無効な認可コードまたは状態です' });
    }

    const { accessToken } = await googleService.registerWithGoogle(
      code,
      deviceId,
      reply // Fastifyのreplyを渡す
    );

    // oauth_stateとdevice_idのクッキーを削除
    reply.clearCookie('oauth_state');
    reply.clearCookie('device_id');

    // 成功時のリダイレクト
    reply.redirect(
      `${FRONTEND_URL}/auth-success?accessToken=${encodeURIComponent(accessToken)}&isLoginFlow=${'false'}`
    );
  } catch (error) {
    console.error('認可コード処理エラー:', error);
    let errorMessage = '不明なエラー';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // エラー時のリダイレクト
    reply.redirect(
      `${FRONTEND_URL}/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
};

export default async function (app: FastifyInstance) {
  app.post('/register-with-email', registerWithEmailHandler);
  app.post(
    '/verify-and-complete-registration',
    verifyAndCompleteRegistrationHandler
  );
  app.get('/google/register/callback', googleRegisterCallbackHandler);
}
