import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { saveMenu, getMenu } from '../services/MenuService';
import { Features } from '../../../sharetypes';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * メニュー保存APIエンドポイント
 * POST /savemenu
 * Request Body: { feature_value: Features[], changed_layout: string }
 */
const saveMenuHandler = async (
  req: FastifyRequest<{
    Body: {
      feature_value: Features[];
      changed_layout: string;
    };
  }> & { user?: { user_id: string } }, // request.user を型に追加
  reply: FastifyReply
) => {
  try {
    const { feature_value, changed_layout } = req.body;
    const user_id = req.user?.user_id; // request.user から user_id を取得

    // user_id が存在しない場合（ミドルウェアで追加されていない場合）
    if (user_id === undefined) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    // feature_value の型チェック
    if (
      !Array.isArray(feature_value) ||
      !feature_value.every(
        (item) =>
          typeof item.value === 'number' && typeof item.title === 'string'
      )
    ) {
      return reply.status(400).send({ message: 'Invalid feature_value format' });
    }

    // MenuService.saveMenu を呼び出してメニューを保存
    await saveMenu(user_id, feature_value, changed_layout);

    reply.status(200).send({ message: 'Menu has been successfully saved' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: (error as Error).message });
  }
};

/**
 * メニュー取得APIエンドポイント
 * GET /getmenu/:userNumber
 * URL Params: userNumber
 */
const getMenuHandler = async (
  req: FastifyRequest<{ Params: { userNumber: string } }>,
  reply: FastifyReply
) => {
  try {
    const userNumber = parseInt(req.params.userNumber, 10);
    if (isNaN(userNumber)) {
      return reply.status(400).send({ message: 'Invalid user number' });
    }

    const menuSettings = await getMenu(userNumber);
    if (!menuSettings) {
      return reply.status(404).send({ message: 'Menu settings not found' });
    }

    // menuSettings は { features: Features[], layout: Layout } 型
    reply.status(200).send(menuSettings);
  } catch (error) {
    // 該当するデータがない場合
    if (error instanceof Error && error.message.includes('404')) {
      return reply.status(404).send({ message: '存在しないページです' });
    }

    // その他のエラーは500エラーとして返す
    reply.status(500).send({ message: 'Internal server error' });
  }
};

// Fastifyプラグインとしてエクスポート
export default async function (app: FastifyInstance) {
  app.post<{
    Body: {
      feature_value: Features[];
      changed_layout: string;
    };
  }>('/savemenu', { preHandler: authenticateToken }, saveMenuHandler); // メニュー保存API
  app.get('/getmenu/:userNumber', getMenuHandler); // メニュー取得API
}