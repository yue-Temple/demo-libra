import dotenv from 'dotenv';
import path from 'path';
// 環境変数の読み込み
const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envPath });

import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';

import { AppDataSource } from './data-source';
import registerRouter from './endpoint/register';
import loginRouter from './endpoint/login';
import authRouter from './endpoint/auth';
import menuRouter from './endpoint/menu';
import profRouter from './endpoint/prof';
import histRouter from './endpoint/hist';
import r2Router from './endpoint/r2';
import './utils/cron';

// Fastifyアプリケーションの初期化
const app = fastify({
  logger: true, // 組み込みのロガーを有効化
  trustProxy: true, // プロキシを信頼（デプロイ環境用）
});

// CORS設定
app.register(fastifyCors, {
  origin: async (origin: string | undefined) => {
    const allowedOrigins = [
      'http://localhost:5174',
      'https://yourdomain.com',
      'https://demo-libra-front.onrender.com',
    ];

    // originがundefinedでない場合のみチェックを行う
    if (!origin || allowedOrigins.includes(origin)) {
      return true;
    } else {
      throw new Error('CORSで許可されていないオリジン');
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// cookie-parser設定（FastifyでCookieを扱う）
app.register(fastifyCookie);

// 環境変数検証
const validateEnvVariables = () => {
  const requiredVars = ['JWT_SECRET_KEY', 'JWT_EXPIRY'];
  requiredVars.forEach((envVar) => {
    if (!process.env[envVar]) throw new Error(`${envVar} が設定されていません`);
  });
};

// セキュリティヘッダー設定フック
app.addHook('onSend', (request, reply, payload, done) => {
  reply.headers({
    Vary: 'Origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  done();
});

// 環境変数検証実行
validateEnvVariables();

// 型付き環境変数エクスポート
export const secretKey = process.env.JWT_SECRET_KEY as string;
export const tokenExpiry = process.env.JWT_EXPIRY as string;

// データベース接続
AppDataSource.initialize()
  .then(() => app.log.info('データベースに接続しました'))
  .catch((err) => app.log.error(`データベース接続エラー: ${err}`));

// ルート登録
app.register(registerRouter, { prefix: '/register' });
app.register(loginRouter, { prefix: '/login' });
app.register(authRouter, { prefix: '/auth' });
app.register(menuRouter, { prefix: '/menu' });
app.register(profRouter, { prefix: '/prof' });
app.register(histRouter, { prefix: '/hist' });
app.register(r2Router, { prefix: '/r2' });

// サーバー起動
const start = async () => {
  try {
    const PORT = Number(process.env.PORT) || 3000;
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`サーバー起動: http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
