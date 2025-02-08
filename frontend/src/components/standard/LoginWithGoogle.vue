<template>
  <button id="google-signin-button" @click="startGoogleAuth" v-if="isLoginFlow">
    Googleでログイン
  </button>
  <button
    id="google-signin-button"
    @click="startGoogleAuth"
    v-if="!isLoginFlow"
  >
    Googleで登録
  </button>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  isLoginFlow: {
    type: Boolean,
    required: true,
  },
});

const userStore = useUserStore();

// Google認証開始関数
const startGoogleAuth = async () => {
  userStore.isLoginFlow = props.isLoginFlow; // ストアにログインOR登録を記録
  console.log(userStore.isLoginFlow);
  console.log(props.isLoginFlow);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    props.isLoginFlow
      ? 'http://localhost:3000/auth/google/login/callback'
      : 'http://localhost:3000/auth/google/register/callback'
  );
  const scope = encodeURIComponent('openid email profile');
  // stateを生成（ランダム文字列 + デバイスID）
  const state = generateRandomString(32);
  const deviceId = getDeviceId();
  const combinedState = `${state}:${deviceId}`; // stateとdeviceIdを結合

  // stateとdeviceIdをセッションストレージに保存
  //sessionStorage.setItem('oauth_state', state);

  // 遷移
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${combinedState}&access_type=offline`;
};

// デバイスIDを生成する関数
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateRandomString(32);
  }
  return deviceId;
};

// ランダムな文字列を生成する関数
const generateRandomString = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
</script>

<style scoped>
#google-signin-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
