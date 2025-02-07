import express from 'express';
import {
  saveProfile,
  getProfileBlocks,
  removeBlock,
} from '../services/ProfileService';

const router = express.Router();

// プロフィールの保存エンドポイント
router.post('/saveprofile', async (req, res) => {
  console.log('Request Body:', JSON.stringify(req.body, null, 2)); // リクエストボディを確認◆

  const { userNumber, blocks } = req.body;

  // 入力データのバリデーション
  if (!userNumber || !blocks || !Array.isArray(blocks)) {
    return res.status(400).json({ error: 'Invalid userNumber or blocks data' });
  }

  try {
    const result = await saveProfile(userNumber, blocks);
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

// ブロックの削除エンドポイント
router.delete('/profiles/:userNumber/blocks/:blockId', async (req, res) => {
  const userNumber = parseInt(req.params.userNumber, 10);
  const blockId = req.params.blockId;

  if (!blockId) {
    return res.status(400).json({ error: 'Invalid block ID' });
  }

  try {
    const result = await removeBlock(userNumber, blockId);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error removing block:', error);
    return res.status(500).json({ error: 'Failed to remove block' });
  }
});

export default router;
