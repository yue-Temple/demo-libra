<template>
  <div>
    <!-- ⋮⋮ ボタン -->
    <div v-if="isEditing" class="more-button" @click="toggleMoreMenu(index)">
      ⋮⋮
    </div>

    <!-- メニュー展開 -->
    <div
      v-if="activeMoreMenu === index && isEditing"
      class="more-menu"
      ref="menuRef"
    >
      <!-- 上下移動ボタン -->
      <button @click="handleMenuButtonClick(() => moveBlockUp(index))">
        ▴ 上に移動
      </button>
      <button @click="handleMenuButtonClick(() => moveBlockDown(index))">
        ▾ 下に移動
      </button>
      <button @click="handleMenuButtonClick(() => removeBlock(block.id))">
        ブロックを削除
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  props: {
    isEditing: {
      type: Boolean,
      required: true,
    },
    activeMoreMenu: {
      type: [Number, null],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    block: {
      type: Object,
      required: true,
    },
  },
  emits: [
    'toggle-more-menu',
    'move-block-up',
    'move-block-down',
    'remove-block',
  ],
  setup(props, { emit }) {
    const menuRef = ref<HTMLElement | null>(null);
    let isMenuOpen = false; // メニューが開いているかどうかを管理
    let isClickOutsideEnabled = true; // handleClickOutside を有効にするかどうかを管理

    // 外部クリックを検知する関数
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isClickOutsideEnabled &&
        isMenuOpen &&
        menuRef.value &&
        !menuRef.value.contains(event.target as Node)
      ) {
        // 外部クリックの場合、メニューを閉じる
        emit('toggle-more-menu', null);
        isMenuOpen = false; // メニューを閉じたらフラグをリセット
      }
    };

    // メニューを開くときにフラグをセット
    const toggleMoreMenu = (index: number) => {
      // メニューを開く前に handleClickOutside を無効化
      isClickOutsideEnabled = false;

      // メニューを開く
      emit('toggle-more-menu', index);
      isMenuOpen = true; // メニューを開いたらフラグをセット

      // メニューが開いた後に handleClickOutside を再度有効化
      setTimeout(() => {
        isClickOutsideEnabled = true;
      }, 0);
    };

    // メニュー内のボタンクリック時の処理
    const handleMenuButtonClick = (action: () => void) => {
      action(); // ボタンのアクションを実行
      emit('toggle-more-menu', null); // メニューを閉じる
    };

    // コンポーネントマウント時にイベントリスナーを追加
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    // コンポーネントアンマウント時にイベントリスナーを削除
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      menuRef,
      toggleMoreMenu,
      handleMenuButtonClick,
    };
  },
  methods: {
    moveBlockUp(index: number) {
      this.$emit('move-block-up', index);
    },
    moveBlockDown(index: number) {
      this.$emit('move-block-down', index);
    },
    removeBlock(blockId: string) {
      this.$emit('remove-block', blockId);
    },
  },
});
</script>

<style scoped>
.more-button {
  position: absolute;
  cursor: pointer;
  font-size: 18px;
  font-weight: bolder;
  padding-left: 0.3rem;
  color: var(--page-text-sub);
}

.more-menu {
  position: absolute;
  top: 0px;
  left: 20px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.more-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: #333;
}

.more-menu button:hover {
  background: #f0f0f0;
}
</style>
