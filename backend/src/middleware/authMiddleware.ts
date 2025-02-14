// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt'; // トークン検証用の関数

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
    const user_id = verifyToken(token); // トークン検証
    if (!user_id) {
      return res
        .status(401)
        .json({ message: 'Invalid token: Token is expired or malformed' });
    }
    req.body.user_id = user_id; // 検証済みのユーザー ID をリクエストオブジェクトに追加
    next(); // 次のミドルウェアまたはルートハンドラに進む
  } catch (error) {
    console.error('Token verification failed:', error);
    return res
      .status(401)
      .json({ message: 'Invalid token: Token is expired or malformed' });
  }
};
