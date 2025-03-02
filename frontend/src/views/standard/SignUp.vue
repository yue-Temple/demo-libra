<template>
  <div class="body">
    <div class="login" v-if="!issend">
      <!-- タイトル -->
      <div class="header">
        <div>Sign <span>Up</span></div>
      </div>

      <h4>メールアドレスで登録</h4>
      <!-- メール・パスワードによる新規登録 -->
      <form @submit.prevent="handleregisterWithEmail">
        <input
          v-model="email"
          type="email"
          placeholder="メールアドレスを入力"
          class="login-username"
          autocomplete="email"
          required
        />
        <PasswordInput v-model="password" placeholder="パスワードを入力" />
        <button type="submit" class="login-submit">登録</button>
      </form>

      <Divider />

      <h4>ソーシャルIDで登録</h4>
      <!-- Googleアカウントで登録 -->
      <LoginWithGoogle :isLoginFlow="false" />

      <!-- エラーメッセージ -->
      <div v-show="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>

    <div class="login" v-if="issend">
      <!-- 認証コードの入力 -->
      <h4>ワンタイムパスワードの入力</h4>
      <p>入力されたメールアドレス宛に、</p>
      <p>ワンタイムパスワードを送信しました。</p>
      <p>15分以内に入力してください。</p>
      <form @submit.prevent="verifyEmail">
        <div class="onepass">
          <InputOtp v-model="authcode" :length="6" integerOnly class="rr" />
        </div>
        <button type="submit" class="login-submit">送信</button>
      </form>
      <!-- エラーメッセージ -->
      <div v-show="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Divider from 'primevue/divider';
import { ref } from 'vue';
import InputOtp from 'primevue/inputotp';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import LoginWithGoogle from '@/components/standard/LoginWithGoogle.vue';
import PasswordInput from '@/components/standard/PasswordInput.vue';

const router = useRouter();
const userStore = useUserStore();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const issend = ref(false); // 認証コード送信フラグ
const authcode = ref('');

// メール・パスワードによる新規登録
const handleregisterWithEmail = async () => {
  try {
    const errorMessageFromAPI = await userStore.registerWithEmail(email.value);
    if (errorMessageFromAPI) {
      // エラーメッセージがある場合は格納
      errorMessage.value = errorMessageFromAPI;
      return;
    }

    // 成功時の処理
    issend.value = true;
    errorMessage.value = '';
  } catch (error) {
    // 予期せぬエラーの場合
    errorMessage.value = (error as Error).message;
  }
};

// 認証コードの検証
const verifyEmail = async () => {
  try {
    await userStore.verifyEmail(email.value, password.value, authcode.value);

    // ユーザーIDを取得
    const userId = userStore.useuserId;
    if (!userId) {
      throw new Error('ユーザーIDが取得できませんでした');
    }

    // UserConfigページへ遷移
    router.push(`/${userId}/user-config`);
  } catch (error) {
    errorMessage.value = (error as Error).message;
    console.error(errorMessage.value);
  }
};
</script>
<style scoped>
.body {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  z-index: 1; /* 他の要素の背面に配置 */
}
.body::before{
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
}
.login h4 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.login p {
  margin: 0;
  font-size: 0.8rem;
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
.login input[type='email'],
.login input[type='password'] {
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

.onepass {
  margin-top: 1rem;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

/* モバイル表示 */
@media (max-width: 600px) {
  .login {
    width: 90%;
  }

  .login input[type='email'],
  .login input[type='password'],
  .login button {
    width: 100%;
  }
}
</style>
