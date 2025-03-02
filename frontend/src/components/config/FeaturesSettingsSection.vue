<template>
  <h2>メニューバー設定</h2>
  <div class="features-settings" v-if="featuresFromDB.length > 0">
    <div v-for="(label, index) in labels" :key="index" class="feature">
      <span>{{ label }}</span>
      <input
        type="number"
        min="0"
        v-model="featuresFromDB[index].value"
        :disabled="isDisabled(featuresFromDB[index].name)"
        class="value-input"
        @input="handleChange"
      />

      <input
        type="text"
        v-model="featuresFromDB[index].title"
        :placeholder="featuresFromDB[index].name"
        :disabled="isDisabled(featuresFromDB[index].name)"
        class="title-input"
        @input="handleTitleChange(index, $event)"
      />
    </div>
    <span v-if="error" class="error">{{ error }}</span>

    <!-- Features Guide -->
    <div class="features-guide">
      0　……利用しない(アクセス可)<br />
      99 ……非公開(アクセス不可)<br />
      1~ ……メニューバーに追加(1=メインページ)<br />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { Features } from '@sharetypes';

// Props の定義
const props = defineProps<{
  featuresFromDB: Features[];
  error?: string;
}>();

// Emit の定義
const emit = defineEmits<{
  (e: 'change-menu', features: Features[]): void;
}>();

// 無効化する条件をチェックする関数 name準拠
const isDisabled = (name: string) => {
  return ['data', 'relation', 'chara'].includes(name);
};

// 変更を監視する
watch(
  () => props.featuresFromDB,
  (newFeatures) => {
    emit('change-menu', newFeatures);
  },
  { deep: true }
);

// 入力時に変更を通知する
const handleChange = () => {
  emit('change-menu', props.featuresFromDB);
};

// タイトル入力時の文字数制限を適用する
const handleTitleChange = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const inputValue = input.value;
  const maxLength = 12; // 半角12文字、全角6文字相当

  // 文字数を計算（全角を2文字、半角を1文字としてカウント）
  let length = 0;
  for (let char of inputValue) {
    length += char.match(/[^\x01-\x7E\uFF61-\uFF9F]/) ? 2 : 1;
  }

  // 制限を超えた場合、入力内容を切り詰める
  if (length > maxLength) {
    let truncatedValue = '';
    let currentLength = 0;
    for (let char of inputValue) {
      const charLength = char.match(/[^\x01-\x7E\uFF61-\uFF9F]/) ? 2 : 1;
      if (currentLength + charLength > maxLength) break;
      truncatedValue += char;
      currentLength += charLength;
    }
    input.value = truncatedValue;
    props.featuresFromDB[index].title = truncatedValue;
  }

  // 変更を通知
  emit('change-menu', props.featuresFromDB);
};

// ※ラベル（※featuresFromDB配列と同じ長さにすること）
const labels = [
  'プロフィール',
  'ヒストリー',
  '未実装機能',
  '未実装機能',
  '未実装機能',
];
</script>

<style scoped>
h2 {
  margin-top: 0;
}

.features-guide {
  font-size: 11px;
  margin-top: 0.5rem;
}

.features-settings {
  margin-top: 10px;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.feature span {
  width: 200px;
  font-weight: bold;
}

.value-input {
  width: 30px;
}

.title-input {
  width: 90px;
  margin-left: 1.5rem;
}

.feature input:disabled {
  background-color: #e0e0e0;
  color: #888;
}

.error {
  color: red;
}
</style>
