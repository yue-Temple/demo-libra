// r2Service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ButtonBlock, InfoBlock, TextButton } from '../../../sharetypes';

// 環境変数を読み込む
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error('必要な環境変数が設定されていません');
}

// S3クライアントの初期化
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * 署名付きURLを生成する関数
 * @param fileName - アップロードするファイル名
 * @returns 署名付きURL
 */
export const generateSignedUrl = async (fileName: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    ContentType: 'image/webp', // アップロードされるファイルのMIMEタイプ
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1時間有効
  return signedUrl;
};

/**
 * CDNURLからオブジェクトキーを抽出するヘルパー関数
 * @param url
 * @returns オブジェクトキー
 */
export function getObjectKey(url: string): string {
  const object_Key = url.replace(`${process.env.CDN_DOMAIN}`, '');
  return object_Key;
}
/**
 * CDN URL 配列からオブジェクトキーを抽出するヘルパー関数
 * @param urls - 画像の CDN URL の配列
 * @returns オブジェクトキーの配列
 */
function getObjectKeys(urls: string[]): string[] {
  return urls.map((url) => url.replace(`${process.env.CDN_DOMAIN}/`, ''));
}

// 以下、削除ロジック
/**
 * プロフ系画像データ削除
 * deleteBlocks配列を検証し、typeに応じて画像データの削除キーを収集し、最後にまとめて削除する
 * @param deleteBlocks - 削除されたブロックの配列
 * @param old_image_urls - 上書きされた画像のURL配列
 *  @returns 削除すべきオブジェクト配列
 */
export async function getdeleteBlocksImageKeys(
  deleteblocks: InfoBlock[],
  old_image_urls: string[]
): Promise<string[]> {
  const deleteKeys: string[] = []; // 削除対象のオブジェクトキーを保持する配列

  // old_image_urls から削除キーを取得して追加
  if (old_image_urls.length > 0) {
    deleteKeys.push(...getObjectKeys(old_image_urls));
  }

  // 各ブロックをループして削除キーを収集
  await Promise.all(
    deleteblocks.map(async (block) => {
      switch (block.type) {
        case 'button':
          collectButtonKeys(block as ButtonBlock, deleteKeys);
          break;
        case 'textbutton':
          collectTextButtonKeys(block as TextButton, deleteKeys);
          break;
        default:
          break;
      }
    })
  );

  return deleteKeys;
}

/**
 * ButtonBlockのbuttons配列内の画像キーを収集する関数
 * @param block - ButtonBlock型のデータ
 * @param deleteKeys - 削除対象のキーを保持する配列
 */
function collectButtonKeys(block: ButtonBlock, deleteKeys: string[]): void {
  if (!block.buttons || block.buttons.length === 0) {
    return; // buttonsが空の場合
  }

  // buttons配列をループして画像キーを収集
  block.buttons.forEach((button) => {
    if (button.image_url) {
      if (typeof button.image_url === 'string') {
        deleteKeys.push(getObjectKey(button.image_url));
      }
    }
  });
}
/**
 * TextButtonのbutton内の画像キーを収集する関数
 * @param block - TextButton型のデータ
 * @param deleteKeys - 削除対象のキーを保持する配列
 */
function collectTextButtonKeys(block: TextButton, deleteKeys: string[]): void {
  if (!block.button) {
    return; // buttonが空の場合
  }

  // buttonの画像キーを収集
  if (block.button.image_url) {
    if (typeof block.button.image_url === 'string') {
      deleteKeys.push(getObjectKey(block.button.image_url));
    }
  }
}

/**
 * ★R2から指定されたファイル(1件)を削除する関数
 * @param imageURL - 削除するファイルのURL
 */
export const deleteFromR2 = async (imageURL: string): Promise<void> => {
  const fileName = getObjectKey(imageURL); // オブジェクトキー抽出

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME, // R2のバケット名
    Key: fileName, // 削除対象のファイル名（オブジェクトキー）
  });

  try {
    await s3Client.send(command);
    console.log(`Deleted ${fileName} from R2`);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw error;
  }
};

/**
 * ★R2から複数のファイルを一括削除
 * @param keys - 削除するファイルのオブジェクトキー配列
 */
export const deleteMultipleFromR2 = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: R2_BUCKET_NAME,
    Delete: { Objects: keys.map((key) => ({ Key: key })) },
  });

  try {
    const response = await s3Client.send(command);
    console.log('削除成功:', response);
  } catch (error) {
    console.error('削除失敗:', error);
    throw error;
  }
};
