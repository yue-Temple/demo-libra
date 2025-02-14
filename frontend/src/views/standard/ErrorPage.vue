<template></template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// URL からエラーメッセージを取得
const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get('message');

if (errorMessage) {
  alert(`エラーが発生しました: ${errorMessage}`);
} else {
  alert('不明なエラーが発生しました');
}

// TopPageページへ遷移
router.push(`/`);
</script>

<style scoped></style>
