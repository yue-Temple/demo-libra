<template>
  <button id="google-signin-button" @click="startGoogleAuth" v-if="isLoginFlow">
    Googleアカウントでログイン
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
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Google認証開始関数
const startGoogleAuth = async () => {
  userStore.isLoginFlow = props.isLoginFlow; // ストアにログインOR登録を記録
  console.log(userStore.isLoginFlow);
  console.log(props.isLoginFlow);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    props.isLoginFlow
      ? `${apiBaseUrl}/auth/google/login/callback`
      : `${apiBaseUrl}/auth/google/register/callback`
  );
  const scope = encodeURIComponent('openid email profile');
  // stateを生成（ランダム文字列 + デバイスID）
  const state = generateRandomString(32);
  const deviceId = getDeviceId();
  const combinedState = `${state}:${deviceId}`; // stateとdeviceIdを結合

  // deviceIdをセッションストレージに保存
  localStorage.setItem('deviceId', deviceId);

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
  margin-left: 5px;
}
#google-signin-button:hover {
  background: #b11813;
}
</style>
