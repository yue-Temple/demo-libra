<template></template>
<script setup lang="ts">
import { goToMainPage } from '@/components/standard/gotomainpage';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

// URL からパラメータを取得
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('accessToken');
const refreshToken = urlParams.get('refreshToken');
const isLoginFlow = urlParams.get('isLoginFlow') === 'true';
userStore.isLoginFlow = isLoginFlow;

if (accessToken && refreshToken) {
  // アクセストークンをセッションストレージに保存 ※非採用
  //sessionStorage.setItem('accessToken', accessToken);

  // アクセストークンをローカルストレージに保存
  localStorage.setItem('accessToken', accessToken);

  // リフレッシュトークンをCookieに保存 クロスサイトでもOK＝SameSite=None
  if (import.meta.env.NODE_ENV === 'development') {
    document.cookie = `refreshToken=${refreshToken}; path=/; SameSite=None; HttpOnly`; //開発用
  } else {
    document.cookie = `refreshToken=${refreshToken}; path=/; Secure; SameSite=Strict; HttpOnly`; //本番用
  }

  // ユーザーストアにアクセストークンを保存
  userStore.setToken(accessToken);

  // 登録時：ユーザー設定ページ　ログイン時：メインページに遷移
  const userId = userStore.useuserId;
  if (isLoginFlow) {
    goToMainPage(router);
  } else {
    router.push(`/${userId}/user-config`);
  }
}
</script>
<style scoped></style>
