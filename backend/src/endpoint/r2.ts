import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateSignedUrl } from '../services/R2Service';

/**
 * 署名付きURLを生成するエンドポイント
 * GET /get-r2signed-url
 * Query Params: fileName
 */
const getR2SignedUrlHandler = async (
  req: FastifyRequest<{ Querystring: { fileName: string } }>,
  reply: FastifyReply
) => {
  try {
    const { fileName } = req.query;

    // ファイル名が存在しない場合
    if (!fileName) {
      return reply.status(400).send({ error: 'File name is required' });
    }

    // 署名付きURLを生成
    const signedUrl = await generateSignedUrl(fileName);

    reply.status(200).send({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    reply.status(500).send({ error: 'Failed to generate signed URL' });
  }
};

// Fastifyプラグインとしてエクスポート
export default async function (app: FastifyInstance) {
  app.get('/get-r2signed-url', getR2SignedUrlHandler); // 署名付きURL生成API
}
