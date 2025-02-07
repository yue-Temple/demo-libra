import dotenv from 'dotenv';
dotenv.config(); // <最初に> .env ファイルを読み込む
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source'; // データベース接続設定
// ルーティングをインポート
import authRouter from './endpoint/auth';
import menuRouter from './endpoint/menu';
import profRouter from './endpoint/prof';
import histRouter from './endpoint/hist';

const app = express();

// CORS設定を関数化
const configureCors = () => {
  const allowedOrigins = [
    'http://localhost:5174', // 開発環境
    'https://yourdomain.com', // 本番環境
  ];
  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
};

// HTTPヘッダー設定を関数化
const configureSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
};

// 環境変数のチェック関数
const validateEnvVariables = () => {
  const requiredVars = ['JWT_SECRET_KEY', 'JWT_EXPIRY'];
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} が設定されていません`);
    }
  }
};

// 環境変数のチェックを実行
validateEnvVariables();

// 型を明示的に `string` にする
export const secretKey: string = process.env.JWT_SECRET_KEY!;
export const tokenExpiry: string = process.env.JWT_EXPIRY!;

// ミドルウェアの設定
app.use(configureCors());
app.use(express.json());
app.use(cookieParser());
app.use(configureSecurityHeaders);

// MySQLとの接続
AppDataSource.initialize()
  .then(() => console.log('MySQL connected'))
  .catch((error) => console.log('Error during MySQL connection:', error));

// ルーティングの設定
app.use('/auth', authRouter);
app.use('/menu', menuRouter);
app.use('/prof', profRouter);
app.use('/hist', histRouter);

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
