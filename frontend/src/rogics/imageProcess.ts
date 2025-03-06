import imageCompression from 'browser-image-compression';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 環境変数を読み込む
const CDN_DOMAIN = import.meta.env.VITE_CDN_DOMAIN;

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
): Promise<{ cdnUrl: string }> => {
  try {
    // Step 1: WebP形式に変換・圧縮
    const webpFile = await convertToWebP(file);

    // Step 2: 一意なファイル名（オブジェクトキー）を生成
    const timestamp = Date.now(); // 現在のタイムスタンプ
    const originalFileName = file.name.replace(/\.[^/.]+$/, ''); // 拡張子を除いた元のファイル名
    const fileName = `${userNumber}/${kind}/${timestamp}_${originalFileName}.webp`;

    // Step 3: バックエンドから署名付きURLを取得
    const response = await fetch(
      `${apiBaseUrl}/r2/get-r2signed-url?fileName=${encodeURIComponent(fileName)}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    const { signedUrl } = await response.json();

    // Step 4: 署名付きURLを使用してR2に直接アップロード
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: webpFile,
      headers: {
        'Content-Type': 'image/webp',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    // Step 5: CDNのURLを生成
    const cdnUrl = generateCDNUrl(fileName);

    // オブジェクトキーとCDNのURLを返す
    return {
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

//R2にアップロードされたファイルのCDN経由のURLを生成
const generateCDNUrl = (fileName: string): string => {
  return `${CDN_DOMAIN}/${fileName}`;
};
