import { InfoBlock, ButtonBlock, TextButton } from '@sharetypes';

/**
 * old_image_url 配列を作成する関数
 * @param newBlocks
 * @param oldBlocks
 * @returns
 */
export const getOldImageurls = (
  newBlocks: InfoBlock[],
  oldBlocks: InfoBlock[]
): string[] => {
  const old_image_urls: string[] = [];

  // oldBlocks を id をキーとしたマップに変換
  const oldBlocksMap = new Map<string, InfoBlock>();
  oldBlocks.forEach((oldBlock) => {
    oldBlocksMap.set(oldBlock.id, oldBlock);
  });

  // newBlocks をループして、対応する oldBlock を取得
  newBlocks.forEach((newBlock) => {
    const oldBlock = oldBlocksMap.get(newBlock.id);

    // oldBlock が存在し、かつ type が一致する場合のみ処理
    if (oldBlock && newBlock.type === oldBlock.type) {
      // ButtonBlock の場合
      if (newBlock.type === 'button') {
        const newButtonBlock = newBlock as ButtonBlock;
        const oldButtonBlock = oldBlock as ButtonBlock;

        // buttons プロパティを確認
        newButtonBlock.buttons?.forEach((newButton, buttonIndex) => {
          const oldButton = oldButtonBlock.buttons?.[buttonIndex];

          // 古いボタンが存在する場合のみ比較
          if (oldButton) {
            // image_url が更新された場合
            if (newButton.image_url !== oldButton.image_url) {
              // oldButton の image_url を old_image_urls 配列に追加
              if (typeof oldButton.image_url === 'string') {
                old_image_urls.push(oldButton.image_url);
              }
            }
          }
        });
      }

      // TextButton の場合
      if (newBlock.type === 'textbutton') {
        const newTextButton = newBlock as TextButton;
        const oldTextButton = oldBlock as TextButton;

        // button プロパティを確認
        const newButton = newTextButton.button;
        const oldButton = oldTextButton.button;

        // 古いボタンが存在する場合のみ比較
        if (oldButton) {
          // image_url が更新された場合
          if (newButton.image_url !== oldButton.image_url) {
            // oldButton の image_url を old_image_urls 配列に追加
            if (typeof oldButton.image_url === 'string') {
              old_image_urls.push(oldButton.image_url);
            }
          }
        }
      }
    }
  });

  return old_image_urls;
};
