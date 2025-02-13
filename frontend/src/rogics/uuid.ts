// ファイル名生成関数（UUID付加）
export const generateUuid = (originalFileName: string): string => {
  const uuid = crypto.randomUUID(); // または uuidライブラリを使用
  return `${uuid}_${originalFileName}`;
};

// デバイスIDを生成する関数
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateRandomString(32);
  }
  return deviceId;
};

// ランダムな文字列を生成する関数
const generateRandomString = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
