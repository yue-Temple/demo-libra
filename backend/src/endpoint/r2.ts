import express from 'express';
import { Request, Response } from 'express';
import { generateSignedUrl } from '../services/R2Service';

const router = express.Router();

// 署名付きURLを生成するエンドポイント
router.get('/get-r2signed-url', async (req: Request, res: Response) => {
  try {
    const fileName = req.query.fileName as string; // 明示的に string 型にキャスト

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    // 署名付きURLを生成
    const signedUrl = await generateSignedUrl(fileName);

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});
export default router;
