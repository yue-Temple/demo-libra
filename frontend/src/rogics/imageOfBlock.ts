import { ButtonBlock, Button, InfoBlock } from '@sharetypes';

/**
 * InfoBlock[] を処理する関数（Fileデータ⇒URL）
 * @param blocks:InfoBlock[]
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

function processButtonBlock(block: ButtonBlock): ButtonBlock {
  throw new Error('Function not implemented.');
}
