// 型拡張
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      user_id: string;
    };
  }
}

// ユーザーロールタイプ
export enum Role {
  Admin = 'admin',
  NormalUser = 'normaluser',
  Guest = 'guest',
  // ★ここに新しいロールを追加
}
