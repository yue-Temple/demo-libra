// ファイル名生成関数（UUID付加）
export const generateUuid = (originalFileName: string): string => {
  const uuid = crypto.randomUUID(); // または uuidライブラリを使用
  return `${uuid}_${originalFileName}`;
};
