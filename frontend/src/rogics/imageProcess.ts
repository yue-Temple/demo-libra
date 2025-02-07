import imageCompression from 'browser-image-compression';

/**◆
 * 画像をWebP形式に変換し、必要に応じて圧縮し、URLとして返却する関数
 * @param file - 変換する画像ファイル
 * @returns URLに変換されたファイル
 */
export const convertToURL = (file: File): string => {
  // WebP変換・圧縮
  const pressfile = convertToWebP(file);
  // URLを入手
  let fileurl = '';
  return fileurl;
};

/**
 * 画像をWebP形式に変換し、必要に応じて圧縮する関数
 * @param file - 変換する画像ファイル
 * @param quality - 画質（0.0 ～ 1.0）
 * @param maxSizeMB - 許容する最大ファイルサイズ（MB）
 * @returns WebP形式に変換されたファイル
 */
export const convertToWebP = async (
  file: File,
  quality: number = 1.0,
  maxSizeMB: number = 5
): Promise<File> => {
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
      quality -= 0.1; // 画質を10%ずつ下げる
      console.log(
        `ファイルサイズが${maxSizeMB}MBを超えています。画質を${quality * 100}%に下げて再変換します。`
      );
      compressedFile = await imageCompression(file, {
        ...options,
        initialQuality: quality,
      });
    }

    return compressedFile;
  } catch (error) {
    console.error('画像の変換中にエラーが発生しました:', error);
    throw error;
  }
};
