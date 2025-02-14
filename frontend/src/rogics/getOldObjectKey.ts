import { InfoBlock, ButtonBlock, TextButton } from '@sharetypes';

// old_object_key 配列を作成する関数
export const getOldObjectKeys = (
  newBlocks: InfoBlock[],
  oldBlocks: InfoBlock[]
): string[] => {
  const old_object_keys: string[] = [];

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
              // oldButton の image_object_key を old_object_keys 配列に追加
              if (oldButton.image_object_key) {
                old_object_keys.push(oldButton.image_object_key);
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
            // oldButton の image_object_key を old_object_keys 配列に追加
            if (oldButton.image_object_key) {
              old_object_keys.push(oldButton.image_object_key);
            }
          }
        }
      }
    }
  });

  return old_object_keys;
};
