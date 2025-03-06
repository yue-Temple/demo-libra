import express from 'express';
import { saveProfile, getProfileBlocks } from '../services/ProfileService';
import {
  getdeleteBlocksImageKeys,
  deleteMultipleFromR2,
} from '../services/R2Service';

const router = express.Router();

// プロフィールの保存エンドポイント
router.post('/saveprofile', async (req, res) => {
  const { userNumber, newblocks, deleteblocks, old_image_urls } = req.body;

  // 入力データのバリデーション
  if (!userNumber || !newblocks || !Array.isArray(newblocks)) {
    return res.status(400).json({ error: 'Invalid userNumber or blocks data' });
  }

  try {
    // ストレージサービスから画像削除の処理
    if (deleteblocks || old_image_urls) {
      const deleteKeys = await getdeleteBlocksImageKeys(
        deleteblocks,
        old_image_urls
      );
      deleteMultipleFromR2(deleteKeys);
    }

    // 他、保存
    const result = await saveProfile(userNumber, newblocks);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
});

// プロフィールブロックの取得エンドポイント
router.get('/profiles/:userNumber/blocks', async (req, res) => {
  const userNumber = parseInt(req.params.userNumber, 10);

  try {
    const blocks = await getProfileBlocks(userNumber);
    return res.status(200).json(blocks);
  } catch (error) {
    console.error('Error fetching profile blocks:', error);
    return res.status(500).json({ error: 'Failed to fetch profile blocks' });
  }
});

// ブロックの削除エンドポイント ※未使用
// router.delete('/profiles/:userNumber/blocks/:blockId', async (req, res) => {
//   const userNumber = parseInt(req.params.userNumber, 10);
//   const blockId = req.params.blockId;

//   if (!blockId) {
//     return res.status(400).json({ error: 'Invalid block ID' });
//   }

//   try {
//     const result = await removeBlock(userNumber, blockId);
//     if (result.success) {
//       return res.status(200).json(result);
//     } else {
//       return res.status(404).json(result);
//     }
//   } catch (error) {
//     console.error('Error removing block:', error);
//     return res.status(500).json({ error: 'Failed to remove block' });
//   }
// });

export default router;
