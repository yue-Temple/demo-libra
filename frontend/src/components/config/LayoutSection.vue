<!-- LayoutSelect.vue -->
<template>
  <div class="selectbuttons">
    <h2>❚ レイアウトを選択</h2>
    <!-- ※keyはオブジェクトプロパティ名 -->
    <div
      v-for="(layout, key, index) in themes"
      :key="key"
      class="button-sample"
    >
      <button
        @click="selectLayout(key)"
        :class="{ active: selectedLayout === key }"
      >
        Layout {{ index + 1 }}
      </button>
      <div
        class="split-circle"
        :style="{
          '--color1': layout.pageBackground,
          '--color2': layout.pageText,
          '--color3': layout.pageAccent,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { themes } from '@/stores/layouts';

const props = defineProps({
  selectnowlayout: {
    required: true,
  },
});

// defineEmits を使ってイベントを定義
const emit = defineEmits<{
  (event: 'change-layout', layout: string): void;
}>();

const selectedLayout = ref(props.selectnowlayout);

// レイアウト選択時
const selectLayout = (layout: string) => {
  selectedLayout.value = layout;
  emit('change-layout', layout);
};
</script>

<style scoped>
.button-sample {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.selectbuttons button {
  width: 4.5rem;
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-right: 1.5rem;
  background-color: var(--page-button);
  color: var(--page-buttontext);
  border: 1.5px solid var(--page-text);
}
/* 選択中のレイアウト */
button.active {
  border: 4px double var(--page-buttontext);
}

/* 色サンプル */
.split-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: solid 1px #ccc;
  position: relative;
  overflow: hidden;
  background: var(--color1);
}
.split-circle::before,
.split-circle::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 50%;
}
.split-circle::before {
  top: 0;
  right: -50%;
  background: var(--color2);
  clip-path: inset(0 50% 0 0);
}
.split-circle::after {
  bottom: 0;
  right: -50%;
  background: var(--color3);
  clip-path: inset(0 50% 0 0);
}
</style>
