import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import jwt from 'jsonwebtoken';
import { secretKey, tokenExpiry } from '../app';

export class AuthSaveService {
  /**
   * ユーザー情報保存API
   * @param user_id
   * @param user_name
   * @param user_icon
   * @returns token
   */
  async saveUser(
    user_id: string,
    user_name: string,
    user_icon: string
  ): Promise<string> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { user_id } });

    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    console.log('koko', user_name);

    // 上書き保存
    user.user_name = user_name;
    user.user_icon = user_icon;
    await userRepository.save(user);

    // トークンを生成して返す
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_name: user.user_name,
        user_number: user.user_number,
        user_role: user.user_role,
        user_email: user.user_email,
        user_googleid: user.google_user_id,
      },
      secretKey,
      { expiresIn: tokenExpiry }
    );

    return token;
  }
}
