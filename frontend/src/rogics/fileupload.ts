import { ButtonBlock, Button, InfoBlock } from '@sharetypes';
import { generateUuid } from './uuid';

/**
 * ヒストリーの画像
 * 画像Fileデータ⇒CDNの一時的URLを取得する関数
 * @param file
 * @returns
 */
export const filetoURL = (file: File | string): string => {
  // ここに処理
  //Fileの場合
  //Base64の場合
  return 'string';
};

/**
 * InfoBlock[] を処理する関数（Fileデータ⇒S3URL）
 * @param blocks
 * @returns
 */
export const processInfoBlocks = async (
  blocks: InfoBlock[]
): Promise<InfoBlock[]> => {
  return Promise.all(
    blocks.map(async (block) => {
      // ★画像を扱うブロックを追加
      if (block.type === 'button') {
        return await processButtonBlock(block as ButtonBlock); // ButtonBlock の場合
      }
      return block; // 他のタイプのブロックはそのまま返す
    })
  );
};

// ButtonBlock：署名付きURLを取得し、Fileをアップロードする関数
const processButtonBlock = async (buttonBlock: ButtonBlock) => {
  if (buttonBlock.buttons) {
    const updatedButtons = await Promise.all(
      buttonBlock.buttons.map(async (button: Button) => {
        if (button.image_url instanceof File) {
          // 一意のファイル名を生成
          const uniqueFileName = generateUuid(button.image_url.name);

          // 署名付きURLを取得（一意のファイル名を使用）
          const presignedUrl = await s3Store.getPresignedUrl(uniqueFileName);

          // ファイルをアップロード
          await s3Store.fileupload(button.image_url, presignedUrl);

          return {
            ...button,
            image_url: presignedUrl, // 署名付きURLを保存
          };
        }
        return button;
      })
    );
    return { ...buttonBlock, buttons: updatedButtons };
  }
  return buttonBlock;
};
