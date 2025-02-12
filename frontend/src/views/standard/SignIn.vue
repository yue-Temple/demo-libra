<template>
  <div class="body">
    <div class="background-blur">
      <div class="grad"></div>
    </div>

    <div class="header">
      <div>Sign<span>In</span></div>
    </div>

    <div class="login">
      <!-- エラーメッセージ -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- メール・パスワードによるログイン -->
      <input
        v-model="email"
        type="text"
        placeholder="email address"
        class="login-username"
      />
      <input
        v-model="password"
        type="password"
        placeholder="password"
        class="login-password"
      />
      <button class="login-submit" @click="handleloginWithEmail">
        ログイン
      </button>

      <!-- Googleアカウントでログイン -->
      <LoginWithGoogle :isLoginFlow="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { goToMainPage } from '@/components/standard/gotomainpage'; // goToMainPage をインポート
import LoginWithGoogle from '@/components/standard/LoginWithGoogle.vue';
import axios from 'axios'; // axios をインポート
import { useUserStore } from '@/stores/userStore'; // ストアのインポート

const email = ref('');
const password = ref('');
const errorMessage = ref(''); // エラーメッセージ用の ref を追加
const userStore = useUserStore();
const router = useRouter(); // ルーターを使うために useRouter を定義

// メール・パスワードによるログイン
const handleloginWithEmail = async () => {
  try {
    // バックエンド API を直接呼び出す
    const response = await axios.post(
      'http://localhost:3000/auth/login-with-email',
      {
        email: email.value,
        password: password.value,
      }
    );

    // レスポンスからトークンを取得
    const { token } = response.data as { token: string };
    // ストアにトークンを保存
    userStore.setToken(token);

    console.log('メールログイン成功');

    // goToMainPage を呼び出してメインページに遷移
    goToMainPage(router);
  } catch (error) {
    console.error('メールログインエラー:', error);
    errorMessage.value = 'メールアドレスもしくはパスワードが間違っています';
  }
};
</script>

<style>
body {
  background-color: #f0f0f0;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Exo:100,200,400');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:700,400,300');

.body {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://cdn.pixabay.com/photo/2016/12/01/20/12/texture-1876086_1280.jpg');
  background-size: cover;
  filter: blur(2px);
  opacity: 0.7; /* 透明度を調整 */
  z-index: 0;
}

.grad {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.663)
  );
  z-index: 1;
  opacity: 0.7;
}

.header {
  position: absolute;
  top: calc(50% - 35px);
  left: calc(50% - 255px);
  z-index: 2;
}

.header div {
  color: #fff;
  font-family: 'Exo', sans-serif;
  font-size: 40px;
  font-weight: 200;
}

.header div span {
  color: #b11813 !important;
}

.login {
  position: absolute;
  top: calc(50% - 75px);
  left: calc(50% - 50px);
  width: 350px;
  padding: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login input[type='text'],
.login input[type='password'] {
  width: 250px;
  height: 30px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  color: #fff; /* テキスト色を白に設定 */
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  padding: 4px;
  margin-bottom: 10px;
}

.login input::placeholder {
  color: #fff; /* プレースホルダー色を白に設定 */
}

.login button {
  width: 250px;
  height: 35px;
  background: #ffffff;
  border: none;
  border-radius: 2px;
  color: #b9b9b9;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}

.login button:hover {
  background: #b11813;
}

/* エラーメッセージのスタイル */
.error-message {
  color: red;
  font-size: 11px;
  margin-bottom: 10px;
}
</style>
