<template>
  <Topbar />
  <div class="horizontal-divider"></div>

  <div class="home">
    <span class="nopage">存在しないページです。</span>
  </div>
</template>

<script setup lang="ts">
// 子コンポーネント
import Topbar from '@/components/standard/topbar.vue';
</script>

<style>
/* ページ全体の背景色 */
body {
  color: var(--page-text);
  background-color: var(--page-background);
}
</style>

<style scoped>
.home {
  margin-top: 52px;
  display: flex;
  flex-direction: column;
}
.horizontal-divider {
  position: fixed;
  top: 32px;
  margin-left: -100%;
  width: 250%;
  position: fixed;
  height: 10px; /* 線の太さ */
  background-color: var(--page-accent); /* 線の色 */
}

.horizontal-divider::before {
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

.nopage {
  font-size: 2rem;
  font-weight: bold;
  padding: 20px;
}
.go-mainpage button {
  background-color: var(--page-button);
  color: var(--page-buttontext);
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 30px;
}
</style>
