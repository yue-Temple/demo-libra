<template>
  <div id="app">
    <router-view></router-view>
    <!-- 正しくコンポーネントがレンダリングされる -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import './assets/toaststyle.css';

// ローカルストレージからアクセストークンを復元
onMounted(() => {
  const userStore = useUserStore();
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken) {
    userStore.setToken(storedToken);
  }
});
</script>

<style>
body {
  position: relative;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  color: var(--page-text);
  background-color: var(--page-background);
  z-index: -1;
}

body::before {
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
  opacity: 0.1;
  z-index: -1; /* 他の要素の背面に配置 */
  pointer-events: none;
}
</style>
