import express, { Request, Response } from 'express';
import { HistoryService } from '../services/HistoryService';
import { HistorygetService } from '../services/HistorygetService';
import {
  deleteBlocksImages,
  deleteFromR2,
  oldFilesDeleteFromR2,
} from '../services/R2Service';

const router = express.Router();
const historyService = new HistoryService();
const historygetService = new HistorygetService();

/**
 * ヒストリ追加APIのエンドポイント
 * POST /histories
 * Request Body: { user_number: number, newHistory: HistoryContainer }
 */
router.post(
  '/addhistories/:user_number',
  async (req: Request, res: Response) => {
    try {
      const user_number = parseInt(req.params.user_number, 10);
      const { newHistory } = req.body;

      if (!user_number || !newHistory) {
        return res
          .status(400)
          .json({ message: 'user_number and newHistory are required' });
      }

      await historyService.addHistory(user_number, newHistory);
      res.status(201).json({ message: 'History added successfully' });
    } catch (error) {
      console.error('Error adding history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * ヒストリ更新APIのエンドポイント
 * PUT /histories/:userNumber
 * Request Body: { updateHistoryContent: HistoryContainer, old_image_object_key: string }
 */
router.put(
  '/updatehistories/:user_number',
  async (req: Request, res: Response) => {
    try {
      const user_number = parseInt(req.params.user_number, 10);
      const { updateHistoryContent, old_object_key } = req.body;

      if (!user_number || !updateHistoryContent) {
        console.log('koko');
        return res
          .status(400)
          .json({ message: 'Invalid user_number or updateHistoryContent' });
      }

      await historyService.updateHistory(user_number, updateHistoryContent);
      // 旧R2データを削除
      if (old_object_key) deleteFromR2(old_object_key);

      res.status(200).json({ message: 'History updated successfully' });
    } catch (error) {
      console.error('Error updating history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * ヒストリプロフ更新APIのエンドポイント
 * PUT /histories/:userNumber
 * Request Body: { blocks: Infoblock[] }
 */
router.put(
  '/historyprofile/:userNumber/:historyId',
  async (req: Request, res: Response) => {
    try {
      const userNumber = parseInt(req.params.userNumber, 10);
      const historyId = req.params.historyId;
      const { newblocks, deleteblocks, old_object_keys } = req.body;

      if (!userNumber || !newblocks) {
        return res
          .status(400)
          .json({ message: 'Invalid user_number or updateHistoryContent' });
      }

      // 削除画像の処理
      if (deleteblocks) deleteBlocksImages(deleteblocks);
      if (old_object_keys) oldFilesDeleteFromR2(old_object_keys);

      await historyService.updateHistoryProfile(
        userNumber,
        historyId,
        newblocks
      );
      res.status(200).json({ message: 'History updated successfully' });
    } catch (error) {
      console.error('Error updating history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * 卓歴削除APIのエンドポイント
 * DELETE /histories/:user_number/:historyId
 * URL Params: user_number, historyId
 * body:data: { delete_image_object_key }
 */
router.delete(
  '/histories/:userNumber/:historyId',
  async (req: Request, res: Response) => {
    try {
      const userNumber = parseInt(req.params.userNumber, 10);
      const historyId = req.params.historyId;
      const { delete_image_object_key } = req.body;

      if (!userNumber || !historyId) {
        return res
          .status(400)
          .json({ message: 'Invalid user_number or historyId' });
      }

      // ストレージサービスから画像削除の処理
      if (delete_image_object_key) deleteFromR2(delete_image_object_key);

      await historyService.deleteHistory(userNumber, historyId);
      res.status(200).json({ message: 'History deleted successfully' });
    } catch (error) {
      console.error('Error deleting history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * 取得APIのエンドポイント
 * GET /histories/:user_number
 * URL Params: user_number
 * Query Params: page, limit, sortBy, sortOrder,serchdate,serchtitle
 */
router.get('/histories/:userNumber', async (req, res) => {
  const userNumber = parseInt(req.params.userNumber);
  if (!userNumber) {
    return res.status(400).json({ message: 'Invalid usernumber' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sortBy = (req.query.sortBy as 'id' | 'date') || 'historyid';
  const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC';
  const serchdate: string | null =
    (req.query.serchdate as string | undefined) ?? null;
  const serchtitle: string | null =
    (req.query.serchtitle as string | undefined) ?? null;

  try {
    const result = await historygetService.getHistories(
      userNumber,
      page,
      limit,
      sortBy,
      sortOrder,
      serchdate,
      serchtitle
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching histories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * ヒストリ詳細一件取得APIのエンドポイント
 * GET /historydetail/:user_number/:history_id
 * URL Params: user_number,history_id
 */
router.get('/historydetail/:userNumber/:historyId', async (req, res) => {
  const userNumber = parseInt(req.params.userNumber);
  const historyId = req.params.historyId;

  // パラメータのバリデーション
  if (!userNumber || !historyId) {
    return res.status(400).json({ message: '不正なアクセスです' });
  }

  try {
    const result = await historygetService.getHistoryDetail(
      userNumber,
      historyId
    );
    res.json(result);
  } catch (error) {
    // 該当するデータがない場合
    if (error instanceof Error) {
      if (error.message === '404') {
        return res.status(404).json({ message: '存在しないページです' });
      }
    }

    // その他のエラーは500エラーとして返す
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
