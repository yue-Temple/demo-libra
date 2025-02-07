import express, { Request, Response } from 'express';
import { HistoryService } from '../services/HistoryService';

const router = express.Router();
const historyService = new HistoryService();

/**
 * 卓歴追加APIのエンドポイント
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
 * 取得APIのエンドポイント
 * GET /histories/:user_number
 * URL Params: user_number
 * Query Params: page, limit, sortBy, sortOrder
 */
router.get('/histories/:user_number', async (req, res) => {
  const userNumber = parseInt(req.params.user_number);
  if (isNaN(userNumber)) {
    return res.status(400).json({ message: 'Invalid user_number' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sortBy = (req.query.sortBy as 'id' | 'date') || 'historyid';
  const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC';

  try {
    const result = await historyService.getHistories(
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
 * 卓歴更新APIのエンドポイント
 * PUT /histories/:user_number
 * Request Body: { updateHistoryContent: HistoryContainer }
 */
router.put('/histories/:user_number', async (req: Request, res: Response) => {
  try {
    const user_number = parseInt(req.params.user_number, 10);
    const { updateHistoryContent } = req.body;

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
 * 卓歴削除APIのエンドポイント
 * DELETE /histories/:user_number/:historyId
 * URL Params: user_number, historyId
 */
router.delete(
  '/histories/:user_number/:historyId',
  async (req: Request, res: Response) => {
    try {
      const user_number = parseInt(req.params.user_number, 10);
      const historyId = req.params.historyId;

      if (isNaN(user_number) || !historyId) {
        return res
          .status(400)
          .json({ message: 'Invalid user_number or historyId' });
      }

      await historyService.deleteHistory(user_number, historyId);
      res.status(200).json({ message: 'History deleted successfully' });
    } catch (error) {
      console.error('Error deleting history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
