import { JwtPayload } from '@sharetypes';

// 画像アップロード時、親に渡すオブジェクト
export interface UploadFile {
  preurl: string; // 署名付きURL
  file: File; // ファイルデータ
}
