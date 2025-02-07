import express, { Request, Response } from 'express';
import { saveMenu, getMenu } from '../services/MenuService';
import { Features } from '../../../sharetypes';

const router = express.Router();

// メニュー保存APIエンドポイント
router.post(
  '/savemenu',
  async (req: Request<any, any, any>, res: Response<any>) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>" 形式で送信されることを想定
      if (!token) {
        return res.status(401).json({ message: 'Token is required' }); // 401 Unauthorized で返す
      }

      // リクエストボディから feature_value と chenged_layout を取得
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

      // MenuService.saveMenu を1回呼び出して、メニューを保存
      await saveMenu(token, feature_value, changed_layout);
      res.status(200).json({ message: 'Menu has been successfully saved' }); // 成功メッセージを統一
    } catch (error) {
      console.error(error); // エラーログを出力してデバッグしやすくする
      res.status(500).json({ error: (error as Error).message }); // 内部サーバーエラーの場合は 500 を返す
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
    console.error('Error in getMenu:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
