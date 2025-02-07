import jwt from 'jsonwebtoken';
import { secretKey } from '../app';

export function verifyToken(token: string): string | null {
  try {
    // JWTを検証してデコードする
    const decoded = jwt.verify(token, secretKey) as { user_id: string };
    return decoded.user_id;
  } catch (error) {
    return null;
  }
}
