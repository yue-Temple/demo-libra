<template>
  <button @click="emitAddContainer">+</button>
</template>

<script setup lang="ts">
// イベントを定義
const emit = defineEmits(['add-container']);

const emitAddContainer = () => {
  emit('add-container');
};
</script>

<style scoped>
button {
  position: fixed;
  bottom: 20px;
  right: 15px;
  width: 50px;
  height: 50px;
  background-color: var(--page-button);
  color: var(--page-buttontext);
  font-size: 2rem;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px var(--shadow);
  z-index: 10;
}

button:hover {
  background-color: var(--page-button-sub); /* ホバー時の背景色 */
  z-index: 1;
}
</style>
