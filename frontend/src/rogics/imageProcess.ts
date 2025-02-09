import imageCompression from 'browser-image-compression';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

// 環境変数を読み込む
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const CDN_DOMAIN = import.meta.env.VITE_CDN_DOMAIN;

if (
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_ACCOUNT_ID ||
  !CDN_DOMAIN
) {
  throw new Error('必要な環境変数が設定されていません');
}

/**
 * 画像をWebP形式に変換し、必要に応じて圧縮し、URLとして返却する関数
 * @param file - 変換する画像ファイル
 * @param userNumber - ユーザーの識別番号
 * @param kind - 利用種類（profile,history,historydetail）
 * @returns { objectKey: string; cdnUrl: string }
 */
export const convertToURL = async (
  file: File,
  userNumber: number,
  kind: string
): Promise<{ objectKey: string; cdnUrl: string }> => {
  try {
    // Step 1: WebP形式に変換・圧縮
    const webpFile = await convertToWebP(file);

    // Step 2: 一意なファイル名（オブジェクトキー）を生成
    const timestamp = Date.now(); // 現在のタイムスタンプ
    const originalFileName = file.name.replace(/\.[^/.]+$/, ''); // 拡張子を除いた元のファイル名
    const fileName = `${userNumber}/${kind}/${timestamp}_${originalFileName}.webp`;

    // Step 3: R2にアップロード
    const uploadedFileName = await uploadToR2(webpFile, fileName);

    // Step 4: CDNのURLを生成
    const cdnUrl = generateCDNUrl(uploadedFileName);

    // オブジェクトキーとCDNのURLを返す
    return {
      objectKey: uploadedFileName, // R2のオブジェクトキー
      cdnUrl: cdnUrl, // CDN経由のURL
    };
  } catch (error) {
    console.error('Error in convertToURL:', error);
    throw error;
  }
};

/**
 * 画像をWebP形式に変換し、必要に応じて圧縮する関数
 * @param file - 変換する画像ファイル
 * @param quality - 画質（0.0 ～ 1.0）
 * @param maxSizeMB - 許容する最大ファイルサイズ（MB）
 * @returns WebP形式に変換されたBlob
 */
const convertToWebP = async (
  file: File,
  quality: number = 1.0,
  maxSizeMB: number = 5
): Promise<Blob> => {
  const options = {
    maxSizeMB, // 最大ファイルサイズ（MB）
    maxWidthOrHeight: 1920, // 最大幅または高さ
    useWebWorker: true, // Web Workerを使用して非同期処理を効率化
    fileType: 'image/webp', // 出力形式をWebPに指定
    initialQuality: quality, // 画質
    preserveExif: false, // Exif情報を保持しない
  };

  try {
    // 画像を圧縮してWebP形式に変換
    let compressedFile = await imageCompression(file, options);

    // ファイルサイズが指定値を超える場合、画質を下げて再変換
    while (compressedFile.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
      quality -= 0.05; // 画質を10%ずつ下げる
      console.log(
        `ファイルサイズが${maxSizeMB}MBを超えています。画質を${quality * 100}%に下げて再変換します。`
      );
      compressedFile = await imageCompression(file, {
        ...options,
        initialQuality: quality,
      });
    }

    // 圧縮されたBlobをそのまま返す
    return compressedFile;
  } catch (error) {
    console.error('画像の変換中にエラーが発生しました:', error);
    throw error;
  }
};

//変換後のファイルをR2にアップロード
const uploadToR2 = async (file: Blob, fileName: string): Promise<string> => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const fileBuffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: new Uint8Array(fileBuffer),
    ContentType: 'image/webp',
  });

  try {
    await client.send(command);
    console.log(`Uploaded ${fileName} to R2`);
    return fileName; // アップロードされたファイル名を返す
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
};

//R2にアップロードされたファイルのCDN経由のURLを生成
const generateCDNUrl = (fileName: string): string => {
  return `${CDN_DOMAIN}/${fileName}`;
};

/**
 * R2から指定されたファイルを削除する関数
 * @param fileName - 削除するファイルのファイル名（オブジェクトキー）
 */
export const deleteFromR2 = async (fileName: string): Promise<void> => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME, // R2のバケット名
    Key: fileName, // 削除対象のファイル名（オブジェクトキー）
  });

  try {
    await client.send(command);
    console.log(`Deleted ${fileName} from R2`);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw error;
  }
};
