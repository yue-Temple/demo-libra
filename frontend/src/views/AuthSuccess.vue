<template></template>
<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

// URL からパラメータを取得
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('accessToken');
const refreshToken = urlParams.get('refreshToken');

console.log(urlParams);

if (accessToken && refreshToken) {
  // アクセストークンをセッションストレージに保存※非採用
  //sessionStorage.setItem('accessToken', accessToken);

  // アクセストークンをローカルストレージに保存
  localStorage.setItem('accessToken', accessToken);

  // リフレッシュトークンをCookieに保存
  document.cookie = `refreshToken=${refreshToken}; path=/; Secure; SameSite=Strict`;
  router.push('/user-config');

  // ユーザーストアにアクセストークンを保存
  userStore.setToken(accessToken);

  // ユーザーIDを取得し、ユーザー設定ページに遷移
  const userId = userStore.useuserId;
  if (userId) {
    router.push(`/${userId}/user-config`);
  } else {
    throw new Error('ユーザー情報が見つかりません');
  }
}
</script>
<style scoped></style>
