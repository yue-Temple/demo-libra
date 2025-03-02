import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { UserTemporary } from './entity/UserTemporary';
import { UserPasswordReset } from './entity/UserPasswordReset';
import { Menu } from './entity/Menu';
import { Profile } from './entity/Profile';
import { History } from './entity/History';
import { HistoryItem } from './entity/HistoryItem';
import { RefreshToken } from './entity/RefreshToken';

export const AppDataSource = new DataSource({
  type: 'postgres', // データベースタイプはpostgresに設定
  url: process.env.DATABASE_URL, // 環境変数で設定したURLを使用
  synchronize: true, // 本番環境では false にすることを推奨
  logging: false,
  entities: [
    User,
    UserTemporary,
    UserPasswordReset,
    Menu,
    Profile,
    History,
    HistoryItem,
    RefreshToken,
  ], // 必要なエンティティをすべてインポートして追加
  migrations: [],
  subscribers: [],
});
