<template>
  <button @click="emitMobileSort">
    <i class="pi pi-filter"></i>
  </button>
</template>

<script setup lang="ts">
// 親から受け取る props を定義
const props = defineProps({
  isMobileSorton: {
    type: Boolean,
    required: true,
  },
});

// イベントを定義
const emit = defineEmits(['update:mobile-sort-on']);

const emitMobileSort = () => {
  // 現在の状態を反転させて親に伝える
  emit('update:mobile-sort-on', !props.isMobileSorton);
};
</script>

<style scoped>
button {
  position: fixed;
  top: 100px;
  right: 0px;
  width: 40px;
  height: 30px;
  margin: 10px;
  background-color: var(--page-button);
  color: var(--page-buttontext);
  border-radius: 4px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px var(--shadow);
  z-index: 800;
}

button:hover {
  background-color: var(--page-button-sub); /* ホバー時の背景色 */
  z-index: 1;
}
</style>
