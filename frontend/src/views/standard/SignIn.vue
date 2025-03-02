<template>
  <div class="body">
    <div class="login">
      <!-- タイトル -->
      <div class="header">
        <div>Sign<span>In</span></div>
      </div>

      <h4>メールアドレスでログイン</h4>
      <!-- メール・パスワードによるログイン -->
      <form @submit.prevent="handleloginWithEmail">
        <input
          v-model="email"
          type="email"
          placeholder="メールアドレスを入力"
          class="login-username"
          required
        />
        <PasswordInput v-model="password" placeholder="パスワードを入力" />
        <button type="submit" class="login-submit">ログイン</button>
      </form>

      <!-- エラーメッセージ -->
      <p v-show="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="reset" @click="goToPassReset">パスワードを忘れた方（再設定）</p>

      <Divider />

      <h4>ソーシャルIDでログイン</h4>
      <!-- Googleアカウントでログイン -->
      <LoginWithGoogle :isLoginFlow="true" />
      <Divider />

      <div class="info">
        <p>ご利用にはアカウント登録(無料)が必要です。<br /></p>
        <p>
          <span class="signup" @click="goToSignUp">新規アカウント登録</span>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Divider from 'primevue/divider';
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { goToMainPage } from '@/components/standard/gotomainpage'; // goToMainPage をインポート
import PasswordInput from '@/components/standard/PasswordInput.vue';
import LoginWithGoogle from '@/components/standard/LoginWithGoogle.vue';

const router = useRouter();
const userStore = useUserStore();
const email = ref('');
const password = ref('');
const errorMessage = ref(''); // エラーメッセージ用の ref を追加

// メール・パスワードによるログイン
const handleloginWithEmail = async () => {
  try {
    // ログイン処理
    await userStore.loginWithEmail(email.value, password.value);
    // メインページに遷移
    goToMainPage(router, null);
  } catch (error) {
    // エラーメッセージを表示
    errorMessage.value =
      error instanceof Error ? error.message : 'ログインに失敗しました';
  }
};

// ボタンを押したときの遷移処理
const goToSignUp = () => {
  router.push('/sign-up');
};
const goToPassReset = () => {
  router.push('/pass-reset');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Exo:100,200,400');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:700,400,300');

.body {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  z-index: 1; /* 他の要素の背面に配置 */
}
.body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../src/assets/texture.webp'); /* テクスチャ画像 */
  background-size: cover; /* 全体にフィット */
  background-repeat: no-repeat; /* 繰り返しなし */
  background-position: center top; /* 中央上部 */
  background-attachment: fixed; /* 固定 */
  opacity: 0.07;
  z-index: 2; /* 他の要素の背面に配置 */
}

.login {
  color: #221406;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  padding: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.login h4 {
  margin-top: 0.5rem;
  margin-bottom: 0;
}

/* タイトル */
.header {
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
}

.header div {
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 40px;
  font-weight: 200;
  text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1);
}

.header div span {
  color: #bd8f49 !important;
}

.login form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login input[type='email'] {
  width: 250px;
  height: 30px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  padding: 4px;
  margin-top: 10px;
  padding-right: 40px;
}
.login input::placeholder {
  color: #ccc;
}

.login button {
  width: 250px;
  height: 35px;
  background: #ffffff;
  border: none;
  border-radius: 2px;
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
  margin-left: 5px;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
}
.login button:hover {
  color: #fff;
  background: #221406;
}

.info p {
  font-size: 0.8rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signup {
  text-decoration: underline;
  color: blue;
  cursor: pointer;
  font-size: 1rem;
}

.reset {
  color: blue;
  cursor: pointer;
  font-size: 0.7rem;
}

/* モバイル表示 */
@media (max-width: 600px) {
  .login {
    width: 90%;
  }

  .login input[type='email'],
  .login button {
    width: 100%;
  }
}

/* エラーメッセージのスタイル */
.error-message {
  color: red;
  font-size: 11px;
  margin: 0px;
}
</style>
