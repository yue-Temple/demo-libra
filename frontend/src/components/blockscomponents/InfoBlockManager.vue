<template>
  <div>
    <!-- ブロック追加ボタンとポップアップ -->
    <EditButton
      v-if="isOwner"
      :isEditing="isEditing"
      @open-popup="showPopup = true"
      @save-page="handleSavePage"
      @edit-page="toggleEditing"
    />
    <AddBlockPopup
      v-if="isOwner"
      :showPopup="showPopup"
      @add-block="handleAddBlock"
      @close-popup="showPopup = false"
    />

    <!-- ブロックコンテナ -->
    <div
      v-for="(block, index) in infoBlocks"
      :key="block.id"
      class="blocks-container"
      :class="{ 'editing-background': isEditing }"
    >
      <!-- メニューボタン -->
      <MoreMenu
        v-if="isOwner"
        :isEditing="isEditing"
        :activeMoreMenu="activeMoreMenu"
        :index="index"
        :block="block"
        @toggle-more-menu="toggleMoreMenu(index)"
        @move-block-up="moveBlockUp(index)"
        @move-block-down="moveBlockDown(index)"
        @remove-block="handleRemoveBlock(block.id)"
      />

      <!-- テキストブロックまたはボタンブロック -->
      <TextBlock
        v-if="block.type === 'text'"
        :content="block.content"
        :styleType="block.styleType"
        :isEditing="isEditing"
        :editNow="isEditNow(block.id)"
        @update:content="updateTextBlock(block.id, $event)"
        @update:editNow="(newEditNow) => toggleEditNow(block.id)"
      />
      <ButtonBlock
        v-else-if="block.type === 'button'"
        :buttonType="block.buttonType"
        :buttons="block.buttons || []"
        :isEditing="isEditing"
        @update:buttons="updateButtonBlock(block.id, $event)"
      />
      <TextButton
        v-else-if="block.type === 'textbutton'"
        :content="block.content"
        :styleType="block.styleType"
        :button="block.button"
        :isEditing="isEditing"
        :editNow="isEditNow(block.id)"
        @update:content="updateTextButtonContent(block.id, $event)"
        @update:button="updateTextButtons(block.id, $event)"
        @update:editNow="(newEditNow) => toggleEditNow(block.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
// 型定義
import { InfoBlock, Button, StyleType, ButtonType } from '@sharetypes';
// 子コンポーネント
import AddBlockPopup from './AddBlockPopup.vue';
import EditButton from './EditButton.vue';
import TextBlock from './TextBlock.vue';
import ButtonBlock from './ButtonBlock.vue';
import MoreMenu from './MoreMenu.vue';
import TextButton from './TextButton.vue';

// Props
const props = defineProps({
  infoBlocks: {
    type: Array as () => InfoBlock[],
    required: true,
  },
});

// Emits
const emit = defineEmits(['save-page', 'update-info-blocks']);

const userStore = useUserStore();
const route = useRoute();
const showPopup = ref(false);
const activeMoreMenu = ref<number | null>(null);
const isEditing = ref(false); // 編集モードフラグ
const isOwner = userStore.checkOwner(route.params.userNumber);

// editNow 状態を Map で管理
const editNowMap = ref(new Map<string, boolean>());

// editNow 状態を初期化関数
const initializeEditNowMap = () => {
  editNowMap.value = new Map(
    props.infoBlocks.map((block) => [block.id, false])
  );
};
// コンポーネントマウント時に初期化
initializeEditNowMap();

// infoBlocks が更新された場合にも再初期化
watch(
  () => props.infoBlocks,
  () => initializeEditNowMap()
);

// editNow 状態を切り替える関数
const toggleEditNow = (blockId: string) => {
  const currentEditNow = editNowMap.value.get(blockId) || false;
  editNowMap.value.set(blockId, !currentEditNow);
};

// editNow 状態を取得する関数
const isEditNow = (blockId: string): boolean => {
  return editNowMap.value.get(blockId) || false;
};

// 画面遷移時のガード
onBeforeRouteLeave((to, from, next) => {
  if (isEditing.value) {
    const confirmMessage =
      '編集中の内容があります。ページを離れてもよろしいですか？';
    if (window.confirm(confirmMessage)) {
      isEditing.value = false; // 編集モードを終了
      next(); // ユーザーがOKを選択した場合、遷移を許可
    } else {
      next(false); // ユーザーがキャンセルを選択した場合、遷移を中止
    }
  } else {
    next(); // 編集中でない場合、遷移を許可
  }
});

// 編集ボタン押下リッスン
const toggleEditing = () => {
  isEditing.value = !isEditing.value;
};

// 保存ボタン押下リッスン
const handleSavePage = async () => {
  try {
    await emit('save-page');
    isEditing.value = false; // 保存成功時のみ編集モードを終了
  } catch (error) {
    console.error('保存に失敗しました:', error);
  }
};

// トグルメニュー操作リッスン
const toggleMoreMenu = (index: number | null) => {
  activeMoreMenu.value = activeMoreMenu.value === index ? null : index;
};

// ブロック分岐
const moveBlockUp = (index: number) => moveBlock(index, 'up');
const moveBlockDown = (index: number) => moveBlock(index, 'down');

// ブロック移動リッスン
const moveBlock = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < props.infoBlocks.length) {
    const newBlocks = [...props.infoBlocks];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    emit('update-info-blocks', newBlocks);
  }
};

// ブロック追加リッスン　★ブロックタイプ追加で編集
const handleAddBlock = (block: {
  type: 'text' | 'button' | 'textbutton' | 'img' | 'CS';
  styleType?: StyleType;
  buttonType?: ButtonType;
}) => {
  let newBlock: InfoBlock;

  switch (block.type) {
    case 'text':
      newBlock = {
        id: Date.now().toString(),
        type: 'text',
        content: '',
        styleType: block.styleType,
      };
      break;
    case 'button':
      const buttons: Button[] = block.buttonType
        ? Array.from(
            {
              length:
                block.buttonType === ButtonType.SmallThreeButton ||
                block.buttonType === ButtonType.BigThreeButton
                  ? 3
                  : block.buttonType === ButtonType.SmallFourButton
                    ? 4
                    : 1,
            },
            () => ({
              title: null,
              title_color: null,
              link_url: null,
              image_url: null,
              image_object_key: null,
              icon_url: null,
            })
          )
        : [];
      newBlock = {
        id: Date.now().toString(),
        type: 'button',
        content: '',
        buttonType: block.buttonType,
        buttons,
      };
      break;
    case 'textbutton':
      newBlock = {
        id: Date.now().toString(),
        type: 'textbutton',
        styleType: block.styleType,
        button: {
          title: null,
          title_color: null,
          link_url: null,
          image_url: null,
          image_object_key: null,
          icon_url: null,
        },
        content: '',
      };
      break;
    case 'img':
      newBlock = {
        id: Date.now().toString(),
        type: 'img',
        content: '',
      };
      break;
    case 'CS':
      newBlock = {
        id: Date.now().toString(),
        type: 'CS',
        content: '',
      };
      break;
    default:
      throw new Error(`Unknown block type: ${block.type}`);
  }

  const newBlocks = [...props.infoBlocks, newBlock];
  // ブロックリストと追加したものを親コンポーネントに送信
  emit('update-info-blocks', newBlocks, newBlock, null);
};

// ブロック削除リッスン
const handleRemoveBlock = (blockId: string) => {
  // 削除対象のブロックを取得
  const deleteBlock = props.infoBlocks.find((block) => block.id === blockId);

  // 現在のブロックリストから削除対象のブロックを除外
  const newBlocks = props.infoBlocks.filter((block) => block.id !== blockId);

  // ブロックリストと削除したものを親コンポーネントに送信
  emit('update-info-blocks', newBlocks, null, deleteBlock);
};

// ブロック更新リッスン
// TextBlock の content を更新するメソッド
const updateTextBlock = (blockId: string, content: string) => {
  const block = props.infoBlocks.find((block) => block.id === blockId);
  if (block) {
    block.content = content; // block が存在する場合のみ更新
  } else {
    console.error(`ブロックが見つかりませんでした`);
  }
};
// ButtonBlock の button を更新するメソッド
const updateButtonBlock = (blockId: string, buttons: Button[]) => {
  const block = props.infoBlocks.find((block) => block.id === blockId);
  if (block && block.type === 'button') {
    block.buttons = buttons;
  }
};
// TextButtonBlock の content を更新するメソッド
const updateTextButtonContent = (blockId: string, content: string) => {
  const block = props.infoBlocks.find((block) => block.id === blockId);
  if (block && block.type === 'textbutton') {
    block.content = content;
  }
};
// TextButtonBlock の button を更新するメソッド
const updateTextButtons = (blockId: string, button: Button) => {
  const block = props.infoBlocks.find((block) => block.id === blockId);
  if (block && block.type === 'textbutton') {
    block.button = button;
  }
};
</script>

<style scoped>
.blocks-container {
  margin-bottom: 0.5rem;
  position: relative;
  transition: background-color 0.3s ease;
  overflow-x: clip;
  overflow-y: visible;
}

.blocks-container.editing-background {
  background-color: var(--page-background-10);
}
</style>
