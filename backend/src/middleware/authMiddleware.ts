import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { secretKey } from '../app'; // secretKey は環境変数などで管理

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>" 形式で送信されることを想定
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    // トークンを検証してデコードする
    const decoded = jwt.verify(token, secretKey) as { user_id: string };

    // トークンに含まれている user_id をリクエストオブジェクトに追加
    req.body.user_id = decoded.user_id;

    next(); // 次のミドルウェアまたはルートハンドラに進む
  } catch (error) {
    console.error('Token verification failed:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token format or signature' });
    }

    return res.status(401).json({ message: 'Invalid token: Token is expired or malformed' });
  }
};
