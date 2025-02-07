<template>
  <button @click="toggleButtonText" class="edit-button">
    {{ buttonText }}
  </button>
  <button v-if="showAddButton" @click="openPopup" class="add-character">
    +
  </button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    allEditNow: {
      type: Boolean,
      required: true,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['edit-page', 'save-page', 'open-popup'], // イベントを明示的に宣言
  setup(props, { emit }) {
    // リアクティブなデータ
    const showAddButton = ref(false);
    const buttonText = ref('編集');

    // メソッド
    const toggleButtonText = () => {
      if (buttonText.value === '編集') {
        buttonText.value = '保存';
        showAddButton.value = true;
        emit('edit-page'); // 編集モードに切り替えるイベントを発行
      } else {
        // 保存ボタンを押したときの処理
        if (props.allEditNow) {
          // EditNow が true の場合、アラートを表示して処理を中断
          alert('編集中のテキストがあります。');
          return; // 保存処理を中断
        }
        buttonText.value = '編集';
        showAddButton.value = false;
        emit('save-page'); // 保存モードに切り替えるイベントを発行
      }
    };

    const openPopup = () => {
      emit('open-popup'); // ポップアップを開くイベントを発行
    };

    // リアクティブなデータとメソッドを返す
    return {
      showAddButton,
      buttonText,
      toggleButtonText,
      openPopup,
    };
  },
});
</script>

<style scoped>
/* 新規作成ボタンのスタイル */
.add-character {
  position: fixed;
  bottom: 90px; /* 編集ボタンの上に配置 */
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: var(--page-button);
  color: var(--page-buttontext);
  font-size: 30px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px var(--shadow);
  z-index: 10;
}

.add-character:hover {
  background-color: var(--page-button-sub); /* ホバー時の背景色 */
  z-index: 1;
}

/* 編集ボタンのスタイル */
.edit-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: var(--page-button);
  color: var(--page-buttontext);
  font-size: 16px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px var(--shadow);
  z-index: 10;
}

.edit-button:hover {
  background-color: var(--page-button-sub); /* ホバー時の背景色 */
  z-index: 1;
}

.add-character::before,
.add-character:hover::before,
.edit-button::before,
.edit-button:hover::before {
  content: '';
  position: absolute;
  bottom: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-image: url('../src/assets/texture.jpg'); /* テクスチャ画像 */
  background-size: cover; /* 画像を全体にフィット */
  background-position: center; /* 中央揃え */
  opacity: 0.1; /* テクスチャの透明度を調整 */
  z-index: 0; /* テクスチャを背景色の上に重ねる */
}
</style>
