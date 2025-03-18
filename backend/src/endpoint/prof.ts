import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { saveProfile, getProfileBlocks } from '../services/ProfileService';
import {
  getdeleteBlocksImageKeys,
  deleteMultipleFromR2,
} from '../services/R2Service';

/**
 * プロフィールの保存エンドポイント
 * POST /saveprofile
 * Request Body: { userNumber: number, newblocks: any[], deleteblocks?: any, old_image_urls?: string[] }
 */
const saveProfileHandler = async (
  req: FastifyRequest<{
    Body: {
      userNumber: number;
      newblocks: any[];
      deleteblocks?: any;
      old_image_urls?: string[];
    };
  }>,
  reply: FastifyReply
) => {
  const { userNumber, newblocks, deleteblocks, old_image_urls = [] } = req.body; // old_image_urls にデフォルト値を設定

  // 入力データのバリデーション
  if (!userNumber || !newblocks || !Array.isArray(newblocks)) {
    return reply
      .status(400)
      .send({ error: 'Invalid userNumber or blocks data' });
  }

  try {
    // ストレージサービスから画像削除の処理
    if (deleteblocks || old_image_urls.length > 0) {
      // old_image_urls が空でない場合のみ処理
      const deleteKeys = await getdeleteBlocksImageKeys(
        deleteblocks,
        old_image_urls
      );
      deleteMultipleFromR2(deleteKeys);
    }

    // 他、保存
    const result = await saveProfile(userNumber, newblocks);
    if (result.success) {
      return reply.status(200).send(result);
    } else {
      return reply.status(404).send(result);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return reply.status(500).send({ error: 'Failed to save profile' });
  }
};

/**
 * プロフィールブロックの取得エンドポイント
 * GET /profiles/:userNumber/blocks
 * URL Params: userNumber
 */
const getProfileBlocksHandler = async (
  req: FastifyRequest<{ Params: { userNumber: string } }>,
  reply: FastifyReply
) => {
  const userNumber = parseInt(req.params.userNumber, 10);

  try {
    const blocks = await getProfileBlocks(userNumber);
    return reply.status(200).send(blocks);
  } catch (error) {
    console.error('Error fetching profile blocks:', error);
    return reply.status(500).send({ error: 'Failed to fetch profile blocks' });
  }
};

// Fastifyプラグインとしてエクスポート
export default async function (app: FastifyInstance) {
  app.post('/saveprofile', saveProfileHandler); // プロフィール保存API
  app.get('/profiles/:userNumber/blocks', getProfileBlocksHandler); // プロフィールブロック取得API
}
