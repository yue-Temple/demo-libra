import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HistoryService } from '../services/HistoryService';
import { HistorygetService } from '../services/HistorygetService';
import {
  getdeleteBlocksImageKeys,
  deleteFromR2,
  deleteMultipleFromR2,
} from '../services/R2Service';

const historyService = new HistoryService();
const historygetService = new HistorygetService();

/**
 * ヒストリ追加APIのエンドポイント
 * POST /histories/addhistories/:user_number
 * Request Body: { newHistory: HistoryContainer }
 */
const addHistoryHandler = async (
  req: FastifyRequest<{
    Params: { user_number: string };
    Body: { newHistory: any };
  }>,
  reply: FastifyReply
) => {
  try {
    const user_number = parseInt(req.params.user_number, 10);
    const { newHistory } = req.body;

    if (!user_number || !newHistory) {
      return reply
        .status(400)
        .send({ message: 'user_number and newHistory are required' });
    }

    await historyService.addHistory(user_number, newHistory);
    reply.status(201).send({ message: 'History added successfully' });
  } catch (error) {
    console.error('Error adding history:', error);
    reply.status(500).send({ message: 'Internal server error' });
  }
};

/**
 * ヒストリ更新APIのエンドポイント
 * PUT /histories/updatehistories/:user_number
 * Request Body: { updateHistoryContent: HistoryContainer, image_url: string }
 */
const updateHistoryHandler = async (
  req: FastifyRequest<{
    Params: { user_number: string };
    Body: { updateHistoryContent: any; image_url?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const user_number = parseInt(req.params.user_number, 10);
    const { updateHistoryContent, image_url } = req.body;

    if (!user_number || !updateHistoryContent) {
      return reply
        .status(400)
        .send({ message: 'Invalid user_number or updateHistoryContent' });
    }

    await historyService.updateHistory(user_number, updateHistoryContent);
    // 旧R2データを削除
    if (image_url) deleteFromR2(image_url);

    reply.status(200).send({ message: 'History updated successfully' });
  } catch (error) {
    console.error('Error updating history:', error);
    reply.status(500).send({ message: 'Internal server error' });
  }
};

/**
 * ヒストリプロフ更新APIのエンドポイント
 * PUT /histories/historyprofile/:userNumber/:historyId
 * Request Body: { newblocks: Infoblock[], deleteblocks?: any, old_image_urls?: string[] }
 */
const updateHistoryProfileHandler = async (
  req: FastifyRequest<{
    Params: { userNumber: string; historyId: string };
    Body: { newblocks: any; deleteblocks?: any; old_image_urls?: string[] };
  }>,
  reply: FastifyReply
) => {
  try {
    const userNumber = parseInt(req.params.userNumber, 10);
    const historyId = req.params.historyId;
    const { newblocks, deleteblocks, old_image_urls } = req.body;

    if (!userNumber || !newblocks) {
      return reply
        .status(400)
        .send({ message: 'Invalid user_number or updateHistoryContent' });
    }

    // 削除画像の処理
    if (deleteblocks || old_image_urls?.length) {
      const deleteKeys = await getdeleteBlocksImageKeys(
        deleteblocks,
        old_image_urls || [] // `undefined`の場合、空配列に代入
      );
      deleteMultipleFromR2(deleteKeys);
    }

    await historyService.updateHistoryProfile(userNumber, historyId, newblocks);
    reply.status(200).send({ message: 'History updated successfully' });
  } catch (error) {
    console.error('Error updating history:', error);
    reply.status(500).send({ message: 'Internal server error' });
  }
};

/**
 * 卓歴削除APIのエンドポイント
 * DELETE /histories/:userNumber/:historyId
 * Request Body: { delete_imageURL?: string }
 */
const deleteHistoryHandler = async (
  req: FastifyRequest<{
    Params: { userNumber: string; historyId: string };
    Body: { delete_imageURL?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userNumber = parseInt(req.params.userNumber, 10);
    const historyId = req.params.historyId;
    const { delete_imageURL } = req.body;

    if (!userNumber || !historyId) {
      return reply
        .status(400)
        .send({ message: 'Invalid user_number or historyId' });
    }

    // ストレージサービスから画像削除の処理
    if (delete_imageURL) deleteFromR2(delete_imageURL);

    await historyService.deleteHistory(userNumber, historyId);
    reply.status(200).send({ message: 'History deleted successfully' });
  } catch (error) {
    console.error('Error deleting history:', error);
    reply.status(500).send({ message: 'Internal server error' });
  }
};

/**
 * 取得APIのエンドポイント
 * GET /histories/:userNumber
 * Query Params: page, limit, sortBy, sortOrder, serchdate, serchtitle
 */
type SortBy = 'date' | 'id';
type SortOrder = 'ASC' | 'DESC';
const getHistoriesHandler = async (
  req: FastifyRequest<{
    Params: { userNumber: string };
    Querystring: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
      serchdate?: string;
      serchtitle?: string;
    };
  }>,
  reply: FastifyReply
) => {
  const userNumber = parseInt(req.params.userNumber, 10);
  if (!userNumber) {
    return reply.status(400).send({ message: 'Invalid usernumber' });
  }

  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);

  // sortByを適切な型にキャストする
  const sortBy: SortBy =
    req.query.sortBy === 'date' || req.query.sortBy === 'id'
      ? (req.query.sortBy as SortBy)
      : 'id'; // デフォルトを'id'に設定

  // sortOrderを適切な型にキャストする
  const sortOrder: SortOrder =
    req.query.sortOrder === 'ASC' || req.query.sortOrder === 'DESC'
      ? (req.query.sortOrder as SortOrder)
      : 'ASC'; // デフォルトを'ASC'に設定

  const serchdate = req.query.serchdate || null;
  const serchtitle = req.query.serchtitle || null;

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
    reply.send(result);
  } catch (error) {
    console.error('Error fetching histories:', error);
    reply.status(500).send({ message: 'Internal server error' });
  }
};

/**
 * ヒストリ詳細一件取得APIのエンドポイント
 * GET /historydetail/:userNumber/:historyId
 */
const getHistoryDetailHandler = async (
  req: FastifyRequest<{ Params: { userNumber: string; historyId: string } }>,
  reply: FastifyReply
) => {
  const userNumber = parseInt(req.params.userNumber, 10);
  const historyId = req.params.historyId;

  // パラメータのバリデーション
  if (!userNumber || !historyId) {
    return reply.status(400).send({ message: '不正なアクセスです' });
  }

  try {
    const result = await historygetService.getHistoryDetail(
      userNumber,
      historyId
    );
    reply.send(result);
  } catch (error) {
    // 該当するデータがない場合
    if (error instanceof Error && error.message === '404') {
      return reply.status(404).send({ message: '存在しないページです' });
    }

    // その他のエラーは500エラーとして返す
    reply.status(500).send({ message: 'Internal server error' });
  }
};

// Fastifyプラグインとしてエクスポート
export default async function (app: FastifyInstance) {
  app.post<{
    Params: { user_number: string };
    Body: { newHistory: any };
  }>('/addhistories/:user_number', addHistoryHandler);

  app.put<{
    Params: { user_number: string };
    Body: { updateHistoryContent: any; image_url?: string };
  }>('/updatehistories/:user_number', updateHistoryHandler);

  app.put<{
    Params: { userNumber: string; historyId: string };
    Body: { newblocks: any; deleteblocks?: any; old_image_urls?: string[] };
  }>('/historyprofile/:userNumber/:historyId', updateHistoryProfileHandler);

  app.delete<{
    Params: { userNumber: string; historyId: string };
    Body: { delete_imageURL?: string };
  }>('/histories/:userNumber/:historyId', deleteHistoryHandler);

  app.get<{
    Params: { userNumber: string };
    Querystring: {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
      serchdate?: string;
      serchtitle?: string;
    };
  }>('/histories/:userNumber', getHistoriesHandler);

  app.get<{
    Params: { userNumber: string; historyId: string };
  }>('/historydetail/:userNumber/:historyId', getHistoryDetailHandler);
}
