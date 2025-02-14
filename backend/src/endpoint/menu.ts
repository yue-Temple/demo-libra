import express, { Request, Response } from 'express';
import { saveMenu, getMenu } from '../services/MenuService';
import { Features } from '../../../sharetypes';
import { authenticateToken } from '../middleware/authMiddleware';
const router = express.Router();

// メニュー保存APIエンドポイント
router.post(
  '/savemenu',
  authenticateToken, // トークン検証ミドルウェア
  async (req: Request<any, any, any>, res: Response<any>) => {
    try {
      const { feature_value, changed_layout } = req.body as {
        feature_value: Features[];
        changed_layout: string;
      };

      // feature_value の型チェック
      if (
        !Array.isArray(feature_value) ||
        !feature_value.every(
          (item) =>
            typeof item.value === 'number' && typeof item.title === 'string'
        )
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid feature_value format' });
      }

      // ミドルウェアで検証済みのユーザー ID を使用
      const user_id = req.body.user_id;

      // MenuService.saveMenu を呼び出してメニューを保存
      await saveMenu(user_id, feature_value, changed_layout);

      res.status(200).json({ message: 'Menu has been successfully saved' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// メニュー取得APIエンドポイント
router.get('/getmenu/:userNumber', async (req: Request, res: Response) => {
  try {
    const userNumber = parseInt(req.params.userNumber, 10);
    if (isNaN(userNumber)) {
      return res.status(400).json({ message: 'Invalid user number' });
    }

    const menuSettings = await getMenu(userNumber);
    if (!menuSettings) {
      return res.status(404).json({ message: 'Menu settings not found' });
    }

    // menuSettings は { features: Features[], layout: Layout } 型
    return res.status(200).json(menuSettings);
  } catch (error) {
    // 該当するデータがない場合
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return res.status(404).json({ message: '存在しないページです' });
      }
    }

    // その他のエラーは500エラーとして返す
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
