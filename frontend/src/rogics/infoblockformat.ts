import {
  BaseInfoBlock,
  ButtonBlock,
  CSBlock,
  ImageBlock,
  InfoBlock,
  TextBlock,
  TextButton,
} from '@sharetypes';

/**
 * 共通の整形関数
 * @param block : BaseInfoBlock
 * @returns {} as InfoBlock
 */
export function formatInfoBlock(block: BaseInfoBlock): InfoBlock {
  switch (block.type) {
    case 'text':
      return formatTextBlock(block);
    case 'button':
      return formatButtonBlock(block);
    case 'textbutton':
      return formatTextButtonBlock(block);
    case 'img':
      return formatImageBlock(block);
    case 'CS':
      return formatCSBlock(block);
    default:
      console.warn(`未知のブロックタイプ: ${block.type}`);
      return {} as InfoBlock;
  }
}

// 整形関数群
function formatTextBlock(block: BaseInfoBlock): TextBlock {
  return {
    id: block.id,
    type: 'text',
    content: block.content,
    styleType: (block as TextBlock).styleType || undefined,
  };
}

function formatButtonBlock(block: BaseInfoBlock): ButtonBlock {
  return {
    id: block.id,
    type: 'button',
    content: block.content,
    buttonType: (block as ButtonBlock).buttonType || undefined,
    buttons: (block as ButtonBlock).buttons || [],
  };
}

function formatTextButtonBlock(block: BaseInfoBlock): TextButton {
  return {
    id: block.id,
    type: 'textbutton',
    content: block.content,
    styleType: (block as TextButton).styleType || undefined,
    button: (block as TextButton).button || { label: '', action: '' },
  };
}

function formatImageBlock(block: BaseInfoBlock): ImageBlock {
  return {
    id: block.id,
    type: 'img',
    content: block.content,
    imageUrl: (block as ImageBlock).imageUrl || '',
  };
}

function formatCSBlock(block: BaseInfoBlock): CSBlock {
  return {
    id: block.id,
    type: 'CS',
    content: block.content,
    csType: (block as CSBlock).csType || '',
  };
}
