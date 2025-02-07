import { Menu } from '../entity/Menu';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { verifyToken } from './jwt';
import { Features } from '../../../sharetypes';

//
/**
 * メニュー取得API
 * @param userNumber
 * @returns
 */
export async function getMenu(
  userNumber: number
): Promise<{ features: Features[]; layout: string } | null> {
  try {
    const menuRepository = AppDataSource.getRepository(Menu);
    const userRepository = AppDataSource.getRepository(User);

    // ユーザーが存在するか確認
    const user = await userRepository.findOne({
      where: { user_number: userNumber },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // ユーザーのメニューを取得
    const menu = await menuRepository.findOne({
      where: { user_number: user.user_number },
    });
    // メニューが存在しない場合、null を返す
    if (!menu) {
      return null;
    }

    // features と layout を含むオブジェクトを返す
    return {
      features: menu.feature_value,
      layout: menu.layout,
    };
  } catch (error) {
    console.error('Failed to get menu:', error);
    throw new Error('Failed to get menu: ' + (error as Error).message);
  }
}

/**
 * メニュー保存API
 * @param token
 * @param feature_value
 * @param changed_layout
 */
export async function saveMenu(
  token: string,
  feature_value: Features[],
  changed_layout: string
): Promise<void> {
  // トークン全体で照合⇒関連のユーザー列、メニュー列を所得
  try {
    const user_id = verifyToken(token) as string;
    if (!user_id) {
      throw new Error('Invalid token: Token is expired or malformed');
    }

    const menuRepository = AppDataSource.getRepository(Menu);
    const userRepository = AppDataSource.getRepository(User);

    // ユーザーが存在するか確認
    const user = await userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new Error('User not found');
    }

    // 既存のメニューが存在するか確認
    let menu = await menuRepository.findOne({
      where: { user_number: user.user_number },
    });
    if (menu) {
      // 既存のメニューが存在する場合は更新
      menu.feature_value = feature_value;
      menu.layout = changed_layout;
    } else {
      // 新規作成
      menu = new Menu(user.user_number, feature_value, changed_layout);
    }

    await menuRepository.save(menu);
  } catch (error) {
    console.error('Failed to save menu:', error);
    throw new Error('Failed to save menu: ' + (error as Error).message);
  }
}
