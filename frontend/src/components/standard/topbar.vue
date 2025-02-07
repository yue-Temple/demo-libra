<template>
  <div class="fixed-top-bar">
    <div class="menu-icon" @click="toggleMenu">
      <span class="menu-icon-line">☰</span>
    </div>
    <div v-if="isMenuOpen" class="fixed-dropdown-menu">
      <ul>
        <li @click="goToUserConfig">ユーザー設定</li>
        <li @click="logout">ログアウト</li>
        <li @click="goToHelp">ヘルプ（使い方）</li>
        <li @click="goToTerms">利用規約</li>
        <li @click="goToPrivacyPolicy">プライバシーポリシー</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useLayoutStore } from '@/stores/layoutStore';

export default defineComponent({
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const layoutStore = useLayoutStore();
    const userId = userStore.useuserId;
    const isMenuOpen = ref(false);

    // レイアウトを適用
    layoutStore.applyTheme();

    // メニュー開閉制御
    const toggleMenu = (): void => {
      isMenuOpen.value = !isMenuOpen.value;
    };
    const closeMenu = (): void => {
      isMenuOpen.value = false;
    };
    const handleDocumentClickForMenu = (event: MouseEvent): void => {
      const menuIcon = document.querySelector('.menu-icon');
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
    const goToUserConfig = (): void => {
      router.push(`/${userId}/user-config`);
    };
    const logout = (): void => {
      userStore.logout();
      router.push('/');
    };
    const goToHelp = (): void => {
      router.push(`/${userId}/help`); //◆
    };
    const goToTerms = (): void => {
      router.push(`/${userId}/terms`); //◆
    };
    const goToPrivacyPolicy = (): void => {
      router.push(`/${userId}/privacy`); //◆
    };

    return {
      isMenuOpen,
      toggleMenu,
      goToUserConfig,
      logout,
      goToHelp,
      goToTerms,
      goToPrivacyPolicy,
    };
  },
});
</script>

<style scoped>
.fixed-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 35px;
  background-color: var(--top-bar-background);
  border-bottom: 1px solid var(--top-bar-line);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 200;
}

.menu-icon {
  cursor: pointer;
  display: flex;
  font-size: larger;
  height: 25px;
  width: 30px;
}

.menu-icon-line {
  color: var(--top-bar-text);
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.menu-icon:hover .menu-icon-line {
  font-weight: bold;
  color: var(--top-bar-text-sub);
}

.fixed-top-bar::before {
  content: ''; /* 必須: 疑似要素を表示 */
  position: absolute; /* 親要素内に固定配置 */
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../src/assets/texture.jpg'); /* テクスチャ画像 */
  background-size: cover; /* 画像を全体にフィット */
  background-position: center; /* 中央揃え */
  opacity: 0.1; /* テクスチャの透明度20% */
  z-index: -1;
}

.fixed-dropdown-menu {
  position: absolute;
  top: 35px;
  right: 20px;
  color: var(--top-bar-text);
  background-color: var(--top-bar-menu-background-80);
  border: 1px solid var(--top-bar-line);
  border-radius: 4px;
  z-index: 201;
  width: 200px;
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
</style>
