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
    const route = null; // コンフィグページからの遷移なのでルートパラメーターなし

    const handleGoToMainPage = () => {
      goToMainPage(router, route);
    };

    return {
      handleGoToMainPage,
    };
  },
});
</script>
