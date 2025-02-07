import { AppDataSource } from '../data-source';
import { Profile } from '../entity/Profile';

// インターフェースのインポート
import { InfoBlock } from '../../../sharetypes';

// プロフィールの保存API（path:"/saveprofile"）
export const saveProfile = async (userNumber: number, blocks: InfoBlock[]) => {
  const profileRepo = AppDataSource.getRepository(Profile);

  // 既存のプロフィールを検索
  let profile = await profileRepo.findOne({
    where: { user_number: userNumber },
  });

  if (profile) {
    profile.blocks = blocks;
    await profileRepo.save(profile);
    return { success: true, message: 'Profile updated successfully' };
  } else {
    // プロフィールが存在しない場合は新規作成
    const newProfile = new Profile(userNumber, blocks);
    newProfile.user_number = userNumber;
    await profileRepo.save(newProfile);
    return { success: true, message: 'Profile created successfully' };
  }
};

// プロフィールブロックの取得API（path:"/profiles/:userNumber/blocks"）
export const getProfileBlocks = async (
  userNumber: number
): Promise<InfoBlock[]> => {
  const profileRepo = AppDataSource.getRepository(Profile);

  const profile = await profileRepo.findOne({
    where: { user_number: userNumber },
    select: ['blocks'], // blocks のみを取得
  });

  return profile?.blocks || []; // null や undefined の場合も空配列を返す
};

// ブロックの削除API ※未使用
export const removeBlock = async (profileId: number, blockId: string) => {
  const profileRepo = AppDataSource.getRepository(Profile);

  const profile = await profileRepo.findOne({
    where: { user_number: profileId },
  });

  if (profile && profile.blocks) {
    // 指定された blockId を持つブロックを削除
    profile.blocks = profile.blocks.filter((block) => block.id !== blockId);
    await profileRepo.save(profile);
    return { success: true, message: 'Block removed successfully' };
  } else {
    return { success: false, message: 'Profile not found or block not found' };
  }
};
