<template>
  <div class="container">
    <div class="texture"></div>
    <div class="topbody">
      <div class="topimage">
        <!-- 画像の挿入 -->
        <!-- <img src="../../assets/kari.jpg" /> -->
        <img src="" />
      </div>
      <div class="content">
        <div class="header">
          <div>
            <span>Libra</span>ry<br />of<br />
            Diora<span>ma</span>
          </div>
        </div>
        <div class="login">
          <div class="catchphrase">プロフ作成＆思い出記録アプリ</div>
          <!-- 始めるボタン -->
          <button class="login-submit" @click="handleGoToMainPage">
            はじめる
          </button>

          <!-- 新規登録ボタン -->
          <!-- <button class="login-submit" @click="goToSignUp">新規登録</button> -->
        </div>
      </div>
    </div>
    <div class="futter"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { goToMainPage } from '@/components/standard/gotomainpage'; // 関数をインポート

const router = useRouter();
const userStore = useUserStore();

window.scrollTo(0, 0);
// 「始める」ボタンを押したときの遷移処理
const handleGoToMainPage = () => {
  checkLogin();
};

// トークンからユーザー情報を取得
const checkLogin = () => {
  if (userStore.token) {
    console.log('ログイン状態-->メインページへ');
    goToMainPage(router, null); // メインページに遷移
  } else {
    console.log('未ログイン状態-->ログインページへ');
    router.push('/sign-in'); // ログインページに遷移
  }
};
</script>

<style scoped>
/* トップ画面＋フッター */
.container {
  position: relative; /* 相対位置を設定 */
  display: flex;
  flex-direction: column; /* 上下に並べる */
  overflow-x: hidden;
  background-color: #ffffff;
  z-index: 1; /* 他の要素の背面に配置 */
}
.texture {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/texture.webp'); /* テクスチャ画像 */
  background-size: cover; /* 全体にフィット */
  background-repeat: no-repeat; /* 繰り返しなし */
  background-position: center top; /* 中央上部 */
  background-attachment: fixed; /* 固定 */
  opacity: 0.07;
  z-index: -10; /* 他の要素の背面に配置 */
  pointer-events: none;
}

/* トップ画面 */
.topbody {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex; /* 子要素を横並びに */
  flex-direction: row; /* 横並びにする */
  z-index: 2;
}
/* フッター */
.futter {
  width: 100vw;
  height: 300px;
  background-color: #221406;
}

/* アニメーション */
@keyframes fadeInFromBottom {
  0% {
    transform: translateY(2%); /* 下から20%の位置からスタート */
    opacity: 0; /* 完全に透明 */
  }
  100% {
    transform: translateY(0); /* 元の位置に移動 */
    opacity: 0.4; /* 透明度を0.4に */
  }
}
@keyframes slideInFromRight {
  0% {
    transform: translateX(2%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 画像 */
.topimage {
  width: 55%;
}
.topimage img {
  position: absolute;
  left: -200px;
  right: 0;
  bottom: 0;
  height: 100%;
  background-size: cover;
  filter: blur(0px);
  opacity: 0.4;
  z-index: 0;
  animation: fadeInFromBottom 1s ease-out forwards; /* アニメーションを適用 */
}

/* 情報群 */
.content {
  flex-grow: 1; /* 残りの領域を埋める */
  width: 40%;
  height: 100%; /* 親要素の高さに合わせる */
  padding: 20px; /* 内側の余白を追加 */
  position: relative;
  animation: slideInFromRight 1s ease-out forwards;
  animation-delay: 0.1s; /* オプション */
  z-index: 0;
}

/* タイトル */
.header {
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 2;
}
.header div {
  color: #fff;
  font-family: 'Exo', sans-serif;
  font-size: 5rem;
  font-weight: 400;
  padding-left: 1rem;
  border-left: #bd8f49 solid 1.5rem;
  text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
}
.header div span {
  color: #bd8f49 !important;
}
/* キャッチフレーズ */
.catchphrase {
  font-size: 1.5rem;
  color: #221406;
  font-family: 'Zen Kurenaido', serif;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 0.9px rgba(255, 255, 255, 0.4);
}

/* 始めるボタン */
.login {
  position: absolute;
  top: 48%;
  width: 500px;
  padding: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login button {
  width: 250px;
  height: 80px;
  background: #ffffff;
  border: none;
  border-radius: 2px;
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 1.7rem;
  font-weight: 400;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
}
.login button:hover {
  background: #221406;
  color: #ffffff;
}

/* モバイル表示 */
@media (max-width: 600px) {
  .topimage {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .topimage img {
    position: absolute;
    left: -200px;
    right: 0;
    bottom: 0;
    height: 100%;
    background-size: cover;
    filter: blur(0px);
    opacity: 0.4;
    z-index: 0;
    animation: fadeInFromBottom 1s ease-out forwards; /* アニメーションを適用 */
  }

  .header {
    position: absolute;
    top: 20px;
    left: 0.5rem;
    z-index: 2;
  }
  .header div {
    color: #fff;
    font-family: 'Exo', sans-serif;
    font-size: 4rem;
    font-weight: 400;
    padding-left: 1rem;
  }

  /* 始めるボタン */
  .login {
    position: absolute;
    top: 52%;
    left: 0%;
    width: 100dvw;
    padding: 0px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  /* キャッチフレーズ */
  .catchphrase {
    font-size: 1.2rem;
    color: #221406;
    font-family: 'Zen Kurenaido', serif;
    margin-bottom: 1rem;
  }
  /* はじめるボタン */
  .login button {
    width: 200px;
    height: 60px;
    background: #ffffff;
    border: none;
    border-radius: 2px;
    color: #221406;
    font-family: 'Exo', sans-serif;
    font-size: 1.7rem;
    font-weight: 400;
    cursor: pointer;
    margin-top: 10px;
    transition: background 0.3s;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
  }
  .login button:hover {
    background: #221406;
    color: #ffffff;
  }
}
</style>
