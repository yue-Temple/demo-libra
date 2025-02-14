import jwt from 'jsonwebtoken';
import { secretKey } from '../app';

export function verifyToken(token: string): string {
  try {
    // JWTを検証してデコードする
    const decoded = jwt.verify(token, secretKey) as { user_id: string };

    return decoded.user_id;
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token format or signature');
    }
    throw new Error('Invalid token: Token is expired or malformed');
  }
}
