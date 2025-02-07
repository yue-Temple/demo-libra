<!-- AddBlockPopup.vue -->
<template>
  <div v-if="showPopup" class="popup">
    <!-- ポップアップ内容 -->
    <div class="popup-content">
      <h2>ブロックを追加</h2>
      <!-- ☆addBlock(type/styleType?/buttonType?) この引数が増加した場合要修正-->

      <div class="scrollable-content">
        <!-- テキストボックスセクション -->
        <h3>▾ テキストボックス</h3>
        <ul>
          <li>
            <button @click="addBlock('text', StyleType.Solid, undefined)">
              通常枠
            </button>
          </li>
          <li>
            <button @click="addBlock('text', StyleType.None, undefined)">
              枠無し（空白）
            </button>
          </li>
          <li>
            <button @click="addBlock('text', StyleType.Dashed, undefined)">
              破線枠
            </button>
          </li>
          <li>
            <button @click="addBlock('text', StyleType.Double, undefined)">
              二重線枠
            </button>
          </li>
        </ul>
        <br />

        <!-- ボタンセクション -->
        <h3>▾ ボタン</h3>
        <ul>
          <li>
            <button
              @click="addBlock('button', undefined, ButtonType.SmallOneButton)"
            >
              ボタン（小） ×1
            </button>
          </li>
          <li>
            <button
              @click="
                addBlock('button', undefined, ButtonType.SmallThreeButton)
              "
            >
              ボタン（小） ×3
            </button>
          </li>
          <li>
            <button
              @click="addBlock('button', undefined, ButtonType.SmallFourButton)"
            >
              ボタン（小） ×4
            </button>
          </li>
          <li>
            <button
              @click="addBlock('button', undefined, ButtonType.BigThreeButton)"
            >
              ボタン（大） ×3
            </button>
          </li>
        </ul>
        <br />

        <!-- その他セクション -->
        <h3>▾ その他</h3>
        <ul>
          <li>
            <button @click="addBlock('textbutton', StyleType.Solid, undefined)">
              テキストボタン
            </button>
          </li>
          <li>
            <button
              @click="
                addBlock('button', undefined, ButtonType.SmallThreeButton)
              "
            >
              ギャラリーブロック
            </button>
          </li>
          <li>
            <button
              @click="addBlock('button', undefined, ButtonType.BigThreeButton)"
            >
              ユーザーアイコン
            </button>
          </li>
          <li>
            <button
              @click="addBlock('button', undefined, ButtonType.SmallFourButton)"
            >
              4ボタン(小)
            </button>
          </li>
        </ul>
      </div>
      <!-- 閉じるボタン -->
      <button class="close-button" @click="closePopup">✖</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { StyleType, ButtonType } from '@sharetypes';

const props = defineProps({
  showPopup: Boolean,
});

const emit = defineEmits(['add-block', 'close-popup']);

const addBlock = (
  type: 'text' | 'button' | 'textbutton',
  styleType?: StyleType,
  buttonType?: ButtonType
) => {
  emit('add-block', { type, styleType, buttonType });
  closePopup();
};

const closePopup = () => {
  emit('close-popup');
};
</script>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 500;
}
.popup-content {
  background-color: var(--page-background);
  padding: 20px;
  border-radius: 5px;
  max-height: 90vh; /* 画面の高さの90%に制限 */
  width: 50dvw; /* ポップアップの幅を設定 */
  display: flex;
  flex-direction: column;
  position: relative; /* 閉じるボタンの位置調整用 */
  box-shadow:
    0 2px 2px var(--shadow),
    0 -2px 2px var(--shadow),
    2px 0 2px var(--shadow),
    -2px 0 2px var(--shadow); /* 四方に影 */
}
@media (max-width: 600px) {
  .popup-content {
    width: 80%;
  }
}

.scrollable-content {
  overflow-y: auto; /* スクロール可能にする */
  flex-grow: 1; /* 残りのスペースを埋める */
  margin-bottom: 10px; /* 閉じるボタンとの間隔 */
  padding: 5px;
}
/* スクロールバーのスタイル */
.scrollable-content::-webkit-scrollbar {
  width: 2px; /* スクロールバーの幅 */
}
.scrollable-content::-webkit-scrollbar-track {
  background: var(--page-background-sub); /* スクロールバーの背景色 */
  border-radius: 4px;
}
.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--page-text-sub); /* スクロールバーの色 */
  border-radius: 4px;
}

h2 {
  margin: 0.5rem;
  margin-top: 0;
}
h3 {
  margin: 10px 0 5px 0; /* 見出しのマージンを調整 */
  font-size: 1.1em;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
li {
  margin: 0px 0;
  height: 50px;
}
.scrollable-content button {
  font-weight: bolder;
  height: 50px;
  width: 100%;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  background: transparent;
  border: none; /* 枠線を削除 */
  border-bottom: 1.5px solid var(--page-button);
  color: var(--page-text);
}
.scrollable-content button:hover {
  color: var(--page-buttontext);
  width: 100%;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  background: linear-gradient(
    to right,
    var(--page-button),
    transparent
  ); /* グラデーション設定 */
  border: none; /* 枠線を削除 */
}

/* 閉じるボタンのスタイル */
.close-button {
  position: absolute;
  background: transparent;
  border: none;
  top: 0.9rem;
  right: 0.9rem;
  width: auto;
  font-size: 1.7rem;
  cursor: pointer;
  z-index: 501; /* ポップアップより前面に表示 */
  color: var(--page-button);
}
.close-button:hover {
  color: var(--page-button-sub); /* ホバー時の色を変更 */
}
</style>
