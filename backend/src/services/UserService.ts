import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import jwt from 'jsonwebtoken';
import { secretKey, tokenExpiry } from '../app';
import { userData } from '../../../sharetypes';
import { generateAccessToken } from './AuthTokenService';

/**
 * ユーザー情報保存API
 * @param user_id
 * @param user_name
 * @param user_icon
 * @returns token
 */
export async function saveUser(
  user_id: string,
  user_name: string,
  user_icon: string
): Promise<string> {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ user_id });

  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  // 上書き保存
  if (user.user_name != user_name) user.user_name = user_name;
  if (user.user_icon != user_icon) user.user_icon = user_icon;
  await userRepository.save(user);

  const token = generateAccessToken(user);

  return token;
}

/**
 * ユーザー情報所得API
 * @param user_id
 * @returns
 */
export async function getUser(user_number: number): Promise<userData> {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ user_number });

  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  // 上書き保存
  const userdata: userData = {
    user_name: user.user_name,
    user_number: user.user_number,
    user_role: user.user_role,
    user_email: user.user_email,
    user_google: user.google_user_id,
    user_icon: user.user_icon,
  };

  return userdata;
}
