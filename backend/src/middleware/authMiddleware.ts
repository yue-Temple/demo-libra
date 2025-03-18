import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import jwt from 'jsonwebtoken';
import { secretKey } from '../app'; // secretKey は環境変数などで管理

/**
 * Fastify用のトークン認証ミドルウェア
 * @param request Fastifyリクエストオブジェクト
 * @param reply Fastifyレスポンスオブジェクト
 * @param done 次の処理に進むためのコールバック
 */
export const authenticateToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const token = request.headers.authorization?.split(' ')[1]; // "Bearer <token>" 形式で送信されることを想定

  // トークンが存在しない場合
  if (!token) {
    return reply.status(401).send({ message: 'Token is required' });
  }

  try {
    // トークンを検証してデコードする
    const decoded = jwt.verify(token, secretKey) as { user_id: string };

    // request.user に user_id を追加
    request.user = { user_id: decoded.user_id };

    done(); // 次の処理に進む
  } catch (error) {
    console.error('Token verification failed:', error);

    // トークンの有効期限切れ
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ message: 'Token has expired' });
    }

    // トークンの形式や署名が無効
    if (error instanceof jwt.JsonWebTokenError) {
      return reply
        .status(401)
        .send({ message: 'Invalid token format or signature' });
    }

    // その他のエラー
    return reply
      .status(401)
      .send({ message: 'Invalid token: Token is expired or malformed' });
  }
};