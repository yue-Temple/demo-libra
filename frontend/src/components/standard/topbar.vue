<template>
  <div class="fixed-top-bar">
    <div class="logo" @click="gototoppage">🌟ロゴ</div>

    <!-- userIconが存在する場合 -->
    <div
      v-if="userIcon != null"
      class="icon"
      :style="{ backgroundImage: `url(${userIcon})` }"
      @click="toggleMenu"
    ></div>

    <!-- userIconが存在しない場合 -->
    <div v-else class="noicon" @click="toggleMenu"></div>

    <!-- メニューが開いている場合に表示 -->
    <div v-if="isMenuOpen" class="fixed-dropdown-menu">
      <ul>
        <li @click="goToMypage"><i class="pi pi-home"></i>　マイページ</li>
        <li @click="goToUserConfig"><i class="pi pi-cog"></i>　ユーザー設定</li>
        <li @click="goToHelp">
          <i class="pi pi-question-circle"></i>　ヘルプ（使い方）
        </li>
        <li @click="logout"><i class="pi pi-sign-out"></i>　ログアウト</li>
      </ul>
    </div>
  </div>
  <div class="horizontal-divider"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { goToMainPage } from './gotomainpage';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const layoutStore = useLayoutStore();
const userId = userStore.useuserId;
const isMenuOpen = ref(false);
const userIcon = userStore.useuseruserIcon;

// レイアウトを適用
layoutStore.applyTheme();

// メニュー開閉制御
const toggleMenu = (): void => {
  isMenuOpen.value = !isMenuOpen.value;
};
const closeMenu = (): void => {
  isMenuOpen.value = false;
};

//
const gototoppage = (): void => {
  router.push(`/`);
};

const handleDocumentClickForMenu = (event: MouseEvent): void => {
  const menuIcon = document.querySelector('.icon');
  const dropdownMenu = document.querySelector('.fixed-dropdown-menu');
  if (
    menuIcon &&
    !menuIcon.contains(event.target as Node) &&
    dropdownMenu &&
    !dropdownMenu.contains(event.target as Node)
  ) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClickForMenu);
});
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClickForMenu);
});

// ページ遷移関数
const goToMypage = (): void => {
  goToMainPage(router, route.params.userNumber);
};
const goToHelp = (): void => {
  alert('デモ版では使えません。');
  return;
  router.push(`/${userId}/help`); //◆
};
const goToUserConfig = (): void => {
  if (userStore.token == null) {
    if (confirm('ログインしていません。ログイン画面に遷移しますか？')) {
      router.push(`/sign-in`);
    }
  } else {
    const userNumber = route.params.userNumber;
    router.push({ path: `/${userId}/user-config`, query: { userNumber } });
  }
};
const logout = (): void => {
  const isConfirmed = confirm('ログアウトします。よろしいですか？');

  if (isConfirmed) {
    userStore.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.fixed-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: var(--top-bar-background);
  border-bottom: 1px solid var(--top-bar-line);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 30;
}

.logo {
  padding-left: 1rem;
  display: flex;
  margin-right: auto;
  color: #ccc;
  cursor: pointer;
}

.icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin: 5px;
  margin-right: 1rem;
  cursor: pointer;
  border: solid 1px #ccc;
  background-color: transparent;
  background-image: url(userIcon); /* 画像のパスを指定 */
  background-size: cover; /* 画像を要素にフィット */
  background-position: center; /* 中央寄せ */
}
.noicon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin: 5px;
  margin-right: 1rem;
  cursor: pointer;
  border: solid 1px #ccc;
  background-color: white;
  background-image: url(@/assets/icon/account_circle.webp); /* 画像のパスを指定 */
  background-size: cover; /* 画像を要素にフィット */
  background-position: center; /* 中央寄せ */
}

.fixed-top-bar::before {
  content: ''; /* 必須: 疑似要素を表示 */
  position: absolute; /* 親要素内に固定配置 */
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/texture.webp'); /* テクスチャ画像 */
  background-size: cover; /* 画像を全体にフィット */
  background-position: center; /* 中央揃え */
  opacity: 0.1; /* テクスチャの透明度20% */
  z-index: -1;
}

.fixed-dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0px;
  color: var(--top-bar-text);
  background-color: var(--top-bar-menu-background-80);
  border: 1px solid var(--top-bar-line);
  border-radius: 4px;
  width: 200px;
  z-index: 200;
}

.fixed-dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fixed-dropdown-menu li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.fixed-dropdown-menu li:hover {
  background-color: var(--top-bar-menu-background-10);
}

.horizontal-divider {
  position: fixed;
  top: 48px;
  margin-left: -100%;
  width: 250%;
  position: fixed;
  height: 10px; /* 線の太さ */
  background-color: var(--page-accent); /* 線の色 */
  z-index: 20;
}
</style>
