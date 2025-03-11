<template>
  <Topbar />

  <div class="home">
    <span v-if="message" class="mess">{{ message }}</span>

    <!-- 戻るボタン -->
    <button @click="goBack" class="back-btn">
      <i class="pi pi-arrow-left"></i>　前のページに戻る
    </button>
  </div>
</template>

<script setup lang="ts">
// 子コンポーネント
import Topbar from '@/components/standard/topbar.vue';
import router from '@/router/router';
import { useRoute } from 'vue-router';

const route = useRoute();
const message = route.query.message;

// 戻るボタンの処理
const goBack = () => {
  router.go(-2); //2つ前のページに戻る
};
</script>

<style scoped>
.home {
  margin-top: 52px;
  display: flex;
  flex-direction: column;
}

.mess {
  font-size: 2rem;
  font-weight: bold;
  padding: 20px;
}

button {
  width: 75%;
  max-width: 300px;
  padding: 0.5rem;
  margin: 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--page-buttontext);
  background-color: var(--page-button);
}
button:hover {
  background-color: var(--page-button-sub);
}
.back-btn {
  display: flex;
  align-items: center; /* 垂直中央 */
  justify-content: center; /* 水平中央 */
}
</style>
