<template>
  <div class="body">
    <div class="background-blur">
      <div class="grad"></div>
    </div>

    <div class="header">
      <div>Top<span>Page</span></div>
    </div>

    <div class="login">
      <!-- 始めるボタン -->
      <button class="login-submit" @click="handleGoToMainPage">始める</button>

      <!-- 新規登録ボタン -->
      <button class="login-submit" @click="goToSignUp">新規登録</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { goToMainPage } from '@/components/standard/gotomainpage'; // 関数をインポート

export default defineComponent({
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    // 「始める」ボタンを押したときの遷移処理
    const handleGoToMainPage = () => {
      checkLogin();
    };

    // トークンからユーザー情報を取得
    const checkLogin = () => {
      if (userStore.token) {
        console.log('ログイン状態-->メインページへ');
        goToMainPage(router); // メインページに遷移
      } else {
        console.log('未ログイン状態-->ログインページへ');
        router.push('/sign-in'); // ログインページに遷移
      }
    };

    // 「新規登録」ボタンを押したときの遷移処理
    const goToSignUp = () => {
      router.push('/sign-up'); // サインアップページに遷移
    };

    return { handleGoToMainPage, goToSignUp };
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Exo:100,200,400');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:700,400,300');

html,
body {
  margin: 0; /* ブラウザのデフォルトマージンを削除 */
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
    rgba(0, 0, 0, 0.397)
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
</style>
