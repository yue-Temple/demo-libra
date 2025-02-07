import { JwtPayload } from '@sharetypes';

// ログイン認証のレスポンス
export interface tokenandmess {
  token: string; // JWTトークン
  messege: string; // メッセージ
}

// 画像アップロード時、親に渡すオブジェクト
export interface UploadFile {
  preurl: string; // 署名付きURL
  file: File; // ファイルデータ
}
