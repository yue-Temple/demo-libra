import express, { Request, Response } from 'express';
import { HistoryService } from '../services/HistoryService';
import { HistorygetService } from '../services/HistorygetService';

const router = express.Router();
const historyService = new HistoryService();
const historygetService = new HistorygetService();

/**
 * ヒストリ追加APIのエンドポイント
 * POST /histories
 * Request Body: { user_number: number, newHistory: HistoryContainer }
 */
router.post('/histories', async (req: Request, res: Response) => {
  try {
    const { user_number, newHistory } = req.body;

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
});

/**
 * ヒストリ更新APIのエンドポイント
 * PUT /histories/:userNumber
 * Request Body: { updateHistoryContent: HistoryContainer }
 */
router.put('/histories/:user_number', async (req: Request, res: Response) => {
  try {
    const user_number = parseInt(req.params.user_number, 10);
    const { updateHistoryContent } = req.body;

    console.log(updateHistoryContent);
    if (isNaN(user_number) || !updateHistoryContent) {
      return res
        .status(400)
        .json({ message: 'Invalid user_number or updateHistoryContent' });
    }

    await historyService.updateHistory(user_number, updateHistoryContent);
    res.status(200).json({ message: 'History updated successfully' });
  } catch (error) {
    console.error('Error updating history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
      const { blocks } = req.body;

      console.log(blocks);

      if (!userNumber || !blocks) {
        return res
          .status(400)
          .json({ message: 'Invalid user_number or updateHistoryContent' });
      }

      await historyService.updateHistoryProfile(userNumber, historyId, blocks);
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
 */
router.delete(
  '/histories/:userNumber/:historyId',
  async (req: Request, res: Response) => {
    try {
      const userNumber = parseInt(req.params.userNumber, 10);
      const historyId = req.params.historyId;

      if (!userNumber || !historyId) {
        return res
          .status(400)
          .json({ message: 'Invalid user_number or historyId' });
      }

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
 * Query Params: page, limit, sortBy, sortOrder
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

  try {
    const result = await historygetService.getHistories(
      userNumber,
      page,
      limit,
      sortBy,
      sortOrder
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

  if (!userNumber || !historyId) {
    return res.status(400).json({ message: 'Invalid' });
  }

  try {
    const result = await historygetService.getHistoryDetail(
      userNumber,
      historyId
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching histories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
