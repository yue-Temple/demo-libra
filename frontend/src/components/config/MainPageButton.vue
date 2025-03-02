<template>
  <button @click="handleGoToMainPage">メインページへ</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { goToMainPage } from '@/components/standard/gotomainpage';

// シンタックスシュガー未使用
export default defineComponent({
  setup() {
    const router = useRouter();

    const handleGoToMainPage = () => {
      goToMainPage(router, null);
    };

    return {
      handleGoToMainPage,
    };
  },
});
</script>
