import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { userData } from '../../../sharetypes';
import { generateAccessToken } from './AuthTokenService';
import { Profile } from '../entity/Profile';
import { HistoryItem } from '../entity/HistoryItem';
import {
  deleteMultipleFromR2,
  getdeleteBlocksImageKeys,
  getObjectKey,
} from './R2Service';

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

/**
 * ユーザーアカウント削除API
 * @param user_id - 削除対象のユーザーID
 */
export async function deleteUseraccount(user_id: string): Promise<void> {
  const userRepository = AppDataSource.getRepository(User);
  const profileRepository = AppDataSource.getRepository(Profile);
  const historyItemRepository = AppDataSource.getRepository(HistoryItem);

  // 削除対象の画像URLを格納する配列
  const deleteKeys: string[] = [];

  try {
    // ユーザーエンティティを取得
    const user = await userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // ユーザーのアイコンを削除対象に追加
    if (user.user_icon) {
      deleteKeys.push(getObjectKey(user.user_icon));
    }

    // Profileエンティティからblocksを取得し、削除対象の画像キーを収集
    const profile = await profileRepository.findOne({
      where: { user_number: user.user_number },
    });
    if (profile?.blocks) {
      await getdeleteBlocksImageKeys(profile.blocks, []);
    }

    // HistoryItem から imgURL と childblock を抽出し、削除対象の画像キーを収集
    const historyItems = await historyItemRepository.find({
      where: { history: { user_number: user.user_number } },
    });

    await Promise.all(
      historyItems.map(async (item) => {
        if (item.imgURL) {
          deleteKeys.push(getObjectKey(item.imgURL));
        }

        if (item.childblock) {
          await getdeleteBlocksImageKeys(item.childblock, []);
        }
      })
    );

    // 収集した画像キーをまとめて削除
    if (deleteKeys.length > 0) {
      await deleteMultipleFromR2(deleteKeys);
    }

    // ユーザーエンティティを削除（CASCADEにより関連エンティティも削除される）
    await userRepository.remove(user);

    console.log(`ユーザー ${user_id} のアカウント削除が完了しました`);
  } catch (error) {
    console.error('ユーザーアカウント削除中にエラーが発生しました:', error);
    throw error;
  }
}
