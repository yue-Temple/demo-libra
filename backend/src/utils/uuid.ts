import { v4 as uuidv4 } from 'uuid';

// ランダムなユーザーIDを生成
export const generateRandomUserId = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12);
};

// ランダムなメール検証用トークンを生成
export const generateverifyToken = () => {
  return uuidv4();
};
