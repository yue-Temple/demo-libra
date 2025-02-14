import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Menu } from './entity/Menu';
import { Profile } from './entity/Profile';
import { History } from './entity/History';
import { HistoryItem } from './entity/HistoryItem';
import { RefreshToken } from './entity/RefreshToken';

export const AppDataSource = new DataSource({
  type: 'postgres', // データベースタイプはpostgresに設定
  host: 'localhost', // ホスト名（localhostに接続する場合）
  port: 5432, // PostgreSQLのデフォルトポート
  username: 'postgres', // PostgreSQLのユーザー名
  password: '7979', // パスワード
  database: 'tkpro_database', // 使用するデータベース名
  synchronize: true, // 本番環境では false にすることを推奨
  logging: false,
  entities: [User, Menu, Profile, History, HistoryItem, RefreshToken], // 必要なエンティティをすべてインポートして追加
  migrations: [],
  subscribers: [],
});
