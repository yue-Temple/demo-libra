// r2Service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
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

// 以下、削除ロジック
/**
 * deleteBlocks配列を検証し、typeに応じて画像データを削除する
 * @param deleteBlocks - 削除されたブロックの配列
 */
export async function deleteBlocksImages(
  deleteblocks: InfoBlock[]
): Promise<void> {
  await Promise.all(
    deleteblocks.map(async (block) => {
      switch (block.type) {
        case 'button':
          await buttonsImagedelete(block as ButtonBlock);
          break;
        case 'textbutton':
          await textbuttonImagedelete(block as TextButton);
          break;
        // 他のタイプはそのまま返す
        default:
          break;
      }
    })
  );
}

/**
 * ButtonBlockのbuttons配列内の画像をR2から削除する関数
 * @param block - ButtonBlock型のデータ
 */
async function buttonsImagedelete(block: ButtonBlock): Promise<void> {
  if (!block.buttons || block.buttons.length === 0) {
    return; // buttonsが空の場合
  }

  // buttons配列をループして画像をR2から削除
  await Promise.all(
    block.buttons.map(async (button) => {
      if (button.image_object_key) {
        console.log('消すオブキー', button.image_object_key);
        await deleteFromR2(button.image_object_key);
      }
    })
  );
}

/**
 * TextButtonのbutton内の画像をR2から削除する関数
 * @param block - TextButton型のデータ
 */
async function textbuttonImagedelete(block: TextButton): Promise<void> {
  if (!block.button) {
    return; // buttonsが空の場合
  }

  // buttonのimage_urlがFile型の場合、convertToURL関数でURLに変換
  if (block.button.image_object_key) {
    await deleteFromR2(block.button.image_object_key);
  }
}

/**
 * R2から指定されたファイル(1件)を削除する関数
 * @param fileName - 削除するファイルのファイル名（オブジェクトキー）
 */
export const deleteFromR2 = async (fileName: string): Promise<void> => {
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
 * 更新で不要になった画像データ（複数件）をR2から削除
 * @param keys
 */
export const oldFilesDeleteFromR2 = async (keys: string[]): Promise<void> => {
  try {
    // 各キーに対して deleteFromR2 を呼び出し、Promise を生成
    const deletePromises = keys.map((key) => deleteFromR2(key));

    // すべての削除処理が完了するまで待機
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error occurred while deleting files:', error);
    throw error; // 必要に応じてエラーを再スロー
  }
};
