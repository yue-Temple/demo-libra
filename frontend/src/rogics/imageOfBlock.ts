import { ButtonBlock, InfoBlock, TextButton } from '@sharetypes';
import { convertToURL } from './imageProcess';

/**
 * addblocks配列を検証し、typeに応じて画像データをURLに差し替える
 * @param addblocks - 追加されたブロックの配列
 * @returns 処理後のaddblocks配列
 */
export async function convertFileToUrl(
  newblocks: InfoBlock[],
  userNumber: number,
  kind: string
): Promise<InfoBlock[]> {
  const processedBlocks = await Promise.all(
    newblocks.map(async (block) => {
      switch (block.type) {
        case 'button':
          await buttonsImageFunc(block, userNumber, kind);
          break;
        case 'textbutton':
          await textbuttonImageFunc(block, userNumber, kind);
          break;
        // 他のタイプはそのまま返す
        default:
          break;
      }
      return block;
    })
  );

  return processedBlocks;
}

/**
 * ButtonBlockのbuttons配列内の画像をURLに変換する関数
 * @param block - ButtonBlock型のデータ
 * @param kind - 利用種類（profile, history, historydetail）
 * @returns 処理後のButtonBlock型のデータ
 */
async function buttonsImageFunc(
  block: ButtonBlock,
  userNumber: number,
  kind: string
): Promise<ButtonBlock> {
  if (!block.buttons || block.buttons.length === 0) {
    return block; // buttonsが空の場合はそのまま返す
  }

  // buttons配列をループして画像をURLに変換
  const processedButtons = await Promise.all(
    block.buttons.map(async (button) => {
      // image_urlがFile型の場合、convertToURL関数でURLに変換
      if (button.image_url instanceof File) {
        const { cdnUrl } = await convertToURL(
          button.image_url,
          userNumber,
          kind
        );

        // 変換結果をbuttonに格納
        button.image_url = cdnUrl;
      }
      return button;
    })
  );

  // 処理後のbuttonsをblockにセット
  block.buttons = processedButtons;
  return block;
}

/**
 * TextButtonのbutton内の画像をURLに変換する関数
 * @param block - TextButton型のデータ
 * @param kind - 利用種類（profile, history, historydetail）
 * @returns 処理後のTextButton型のデータ
 */
async function textbuttonImageFunc(
  block: TextButton,
  userNumber: number,
  kind: string
): Promise<TextButton> {
  if (!block.button) {
    return block; // buttonsが空の場合はそのまま返す
  }

  // buttonのimage_urlがFile型の場合、convertToURL関数でURLに変換
  if (block.button.image_url instanceof File) {
    const { cdnUrl } = await convertToURL(
      block.button.image_url,
      userNumber,
      kind
    );

    // 変換結果をbuttonに格納
    block.button.image_url = cdnUrl;
  }

  return block;
}
