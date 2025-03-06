<template>
  <div class="popup">
    <!-- 通常のポップアップ内容 -->
    <div class="popup-content">
      <div class="h2-cancel">
        <!-- 見出し -->
        <h2>
          <i class="pi pi-exclamation-triangle" style="font-size: 1.5rem"></i
          >警告
        </h2>
        <!-- キャンセルボタン -->
        <button class="cancel" @click="closePopup">✖</button>
      </div>

      <p>
        関連データは全て消去されます。<span class="warn1">復元はできません</span
        >。
      </p>
      <p>
        削除する場合は以下に<br />"<span class="warn2"
          >アカウントを削除します</span
        >"<br />と入力し、決定ボタンを押してください。
      </p>

      <!-- 入力フィールド -->
      <input
        type="text"
        v-model="userInput"
        placeholder="アカウントを削除します"
        class="input-field"
      />

      <!-- エラーメッセージ -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- 決定ボタン -->
      <div class="form-bottom">
        <div class="form-actions">
          <button type="submit" class="ok" @click="okdelete">
            <b>決定</b>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router/router';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';

const emit = defineEmits(['close']);

const userStore = useUserStore();
const userInput = ref(''); // ユーザー入力
const errorMessage = ref(''); // エラーメッセージ

// ポップアップを閉じる
const closePopup = () => {
  emit('close');
};

// 決定ボタンの処理
const okdelete = () => {
  if (userInput.value === 'アカウントを削除します') {
    // 入力が正しい場合の処理
    errorMessage.value = ''; // エラーメッセージをクリア
    userStore.deleteAccount(); // API呼び出し
    closePopup(); // ポップアップを閉じる
    userStore.clearToken();
    router.push(`/`);
  } else {
    // 入力が間違っている場合
    errorMessage.value = '入力が間違っています';
  }
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
  z-index: 200;
}

.popup-content {
  background-color: var(--page-background);
  padding: 20px;
  border-radius: 5px;
  width: 500px; /* ポップアップの幅を設定 */
  max-width: 65dvw;
  height: auto; /* 高さを自動調整 */
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 2px 2px var(--shadow),
    0 -2px 2px var(--shadow),
    2px 0 2px var(--shadow),
    -2px 0 2px var(--shadow); /* 四方に影 */
}

@media (max-width: 600px) {
  .popup-content {
    margin-top: 40px;
    width: 80dvw;
    max-width: 80dvw;
    max-height: 75vh;
  }
}

/* 見出し */
h2 {
  margin: 0px !important;
  margin-left: 1rem !important;
  padding-top: 8px !important;
  font-size: 24px !important;
}

.h2-cancel {
  display: flex;
  margin-bottom: 0.5rem;
}

/* 閉じるボタンのスタイル */
.cancel {
  color: var(--page-button);
  background-color: transparent;
  border: none;
  font-size: 1.7rem;
  cursor: pointer;
  margin-left: auto;
  padding-top: 0px;
}

.cancel:hover {
  color: var(--page-button-sub);
}

/* 入力フィールド */
.input-field {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.warn1 {
  font-weight: bold; /* 太文字 */
  text-decoration: underline; /* 文字に下線 */
}
.warn2 {
  font-weight: bold; /* 太文字 */
  text-decoration: underline; /* 文字に下線 */
  color: brown;
}

/* エラーメッセージ */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

/* 決定ボタン */
.ok {
  background-color: var(--page-button);
  color: var(--page-buttontext);
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 1rem;
}

.ok:hover {
  background-color: var(--page-button-sub);
}
</style>
