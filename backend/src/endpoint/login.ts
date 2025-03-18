import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthMailService } from '../services/AuthMailService';
import { AuthGoogleService } from '../services/AuthGoogleService';

const mailService = new AuthMailService();
const googleService = new AuthGoogleService();

const FRONTEND_URL = process.env.FRONTEND_URL;

export const loginWithEmailHandler = async (
  req: FastifyRequest<{
    Body: { email: string; password: string; deviceId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, deviceId } = req.body;
    const token = await mailService.loginWithEmail(
      email,
      password,
      deviceId,
      reply
    );
    reply.status(200).send({ message: 'メールログイン成功', token });
  } catch (error) {
    reply.status(422).send({
      message: 'メールアドレスもしくはパスワードが間違っています',
      error: (error as Error).message,
    });
  }
};

export const googleLoginCallbackHandler = async (
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
    const { accessToken } = await googleService.loginWithGoogle(
      code,
      deviceId,
      reply
    );
    reply.clearCookie('oauth_state');
    reply.redirect(
      `${FRONTEND_URL}/auth-success?accessToken=${encodeURIComponent(accessToken)}&isLoginFlow=${'true'}`
    );
  } catch (error) {
    console.error('認可コード処理エラー:', error);
    let errorMessage = '不明なエラー';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    reply.redirect(
      `${FRONTEND_URL}/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
};

export default async function (app: FastifyInstance) {
  app.post('/login-with-email', loginWithEmailHandler);
  app.get('/google/login/callback', googleLoginCallbackHandler);
}
