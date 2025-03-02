<template>
  <nav>
    <ul>
      <li
        v-for="(feature, index) in sortedFeatures"
        :key="index"
        :class="{ current: isCurrentPage(feature.name) }"
      >
        <router-link :to="`/${userNumber}/` + feature.name">{{
          feature.title
        }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Features } from '@sharetypes';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const userStore = useUserStore();
// URLのパラメータからuserNumberを取得
const userNumber = Number(route.params.userNumber);

// 現在のページがメニューの名前を含んでいるかどうかを確認
const isCurrentPage = (featureName: string): boolean => {
  return route.path.includes(featureName);
};

// sortedFeatures を computed で定義して型を明示的に指定
const sortedFeatures = computed<Features[]>(() => {
  return userStore.features // ストアからデータを取得
    .filter((feature: Features) => feature.value !== 0)
    .sort((a, b) => a.value - b.value);
});
</script>

<style scoped>
nav {
  border-top: 1px solid var(--menu-bar-line);
  border-bottom: 1px solid var(--menu-bar-line);
  position: fixed;
  top: 49px;
  left: 0;
  height: 52px;
  width: 100%;
  background-color: var(--menu-bar-background);
  box-shadow: 0 2px 4px var(--shadow);
  z-index: 29;
}

nav ul {
  display: table;
  margin: 0 auto;
  padding: 0;
  width: 80%;
  text-align: center;
}

nav ul li {
  display: table-cell;
  min-width: 50px;
  height: 50px;
  border-right: 1px solid var(--menu-bar-line);
  transition: background-color 0.3s ease;
}

nav ul li:first-child {
  border-left: 1px solid var(--menu-bar-line);
}

/* ボックス＋アンダーライン */
nav ul li a {
  display: block;
  width: 100%;
  height: 50px;
  padding: 7px 0;
  text-decoration: none;
  color: var(--menu-bar-text);
  transition: color 0.3s ease;
  position: relative;
  font-size: 1.3rem;
}
nav ul li a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: transparent;
  transition: background-color 0.3s ease;
}
nav ul li a:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: var(--menu-bar-under2); /* 背景色 */
  z-index: 1; /* 背景色を前面に */
}

/* いらない */
nav ul li.current a::before,
nav ul li a:hover::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../src/assets/texture.jpg'); /* テクスチャ画像 */
  background-size: cover; /* 画像を全体にフィット */
  background-position: center; /* 中央揃え */
  opacity: 0.1; /* テクスチャの透明度を調整 */
  z-index: 2; /* テクスチャを背景色の上に重ねる */
}

/* 選択中のアンダーライン */
nav ul li.current a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: var(--menu-bar-under); /* 背景色 */
  z-index: 1; /* 背景色を前面に */
}
</style>
