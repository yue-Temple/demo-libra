<template>
  <div class="my-component">
    <!-- コンポーネントのテンプレート -->
    <h1>タイトル</h1>
    <p>ここに内容を表示します。</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MyComponent',
  setup() {
    // ここにロジックや状態を定義できます
    return {
      // テンプレートで使用するデータやメソッド
    };
  },
});
</script>

<style scoped></style>
