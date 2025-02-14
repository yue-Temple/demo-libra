<template>
  <div class="body">
    <div class="background-blur">
      <div class="grad"></div>
    </div>
    <div class="header">
      <div>Sign <span>Up</span></div>
    </div>
    <div class="login">
      <!-- フォームタグを使用 -->

        <!-- メール・パスワードによる新規登録 -->
        <input
          v-model="email"
          type="email"
          placeholder="email address"
          class="login-username"
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          placeholder="password"
          class="login-password"
          autocomplete="new-password"
        />
        <button class="login-submit" @click="handleregisterWithEmail">メールアドレスで登録</button>

        <!-- Googleアカウントで登録 -->
        <LoginWithGoogle :isLoginFlow="false" />


      <!-- エラーメッセージ -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import LoginWithGoogle from '@/components/standard/LoginWithGoogle.vue';

    const userStore = useUserStore();
    const email = ref('');
    const password = ref('');
    const errorMessage = ref(''); 
    const router = useRouter();

    // メール・パスワードによる新規登録
    const handleregisterWithEmail = async () => {
      alert("デモ版ではこの機能は使えません。アカウント作成はGoogleアカウント連携のみとなります。");
      return
      try {
        userStore.registerWithEmail(email.value, password.value);
        console.log('メールで登録完了');

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
.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

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

.login input[type='email'],
.login input[type='password'] {
  width: 250px;
  height: 30px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  color: #fff;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  padding: 4px;
  margin-bottom: 10px;
}

.login input::placeholder {
  color: #fff;
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
  margin-left: 5px;
}

.login button:hover {
  background: #b11813;
}

/* モバイル表示 */
@media (max-width: 600px) {
  .header {
    position: absolute;
    top: calc(30% - 50px);
    left: calc(40% - 90px);
  }
  .login {
    position: absolute;
    top: calc(60% - 75px);
    left: calc(30% - 75px);
  }
}
</style>
