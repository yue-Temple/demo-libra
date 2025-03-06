<template>
  <h2>メニューバー設定</h2>
  <!-- Features Guide -->
  <div class="features-guide">
    左から1~9の番号順に並びます。<br />
    1に設定したページがあなたのメインページになります。<br />
    0に設定したページはメニューバーに追加されません。<br />

  </div>
  <br />
  ページ｜自分用｜他ユーザー｜タイトル｜アクセス
  <div class="features-settings" v-if="featuresFromDB.length > 0">
    <div v-for="(label, index) in labels" :key="index" class="feature">
      <span class="pagetitle">{{ label }}</span>
      <!-- 自分視点の入力（10の位） -->
      <input
        type="number"
        min="0"
        max="9"
        v-model="selfViewValues[index]"
        :disabled="isDisabled(featuresFromDB[index].name)"
        class="value-input"
        @input="handleChange(index)"
      />
      <!-- 他ユーザー視点の入力（1の位） -->
      <input
        type="number"
        min="0"
        max="9"
        v-model="otherViewValues[index]"
        :disabled="isDisabled(featuresFromDB[index].name)"
        class="value-input"
        @input="handleChange(index)"
      />
      <!-- タイトル入力 -->
      <input
        type="text"
        v-model="featuresFromDB[index].title"
        :placeholder="featuresFromDB[index].name"
        :disabled="isDisabled(featuresFromDB[index].name)"
        class="title-input"
        @input="handleTitleChange(index, $event)"
      />
      <!-- アクセス許可/不可ボタン（百の位） -->
      <button
        :class="{ active: accessValues[index] === 1 }"
        @click="toggleAccess(index)"
        :disabled="
          isDisabled(featuresFromDB[index].name) || otherViewValues[index] >= 1
        "
      >
        {{ accessValues[index] === 1 ? '許可' : '不可' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Features } from '@sharetypes';

// Props の定義
const props = defineProps<{
  featuresFromDB: Features[];
}>();

// Emit の定義
const emit = defineEmits<{
  (e: 'change-menu', features: Features[]): void;
}>();

// 自分視点の値（10の位）
const selfViewValues = ref<number[]>(
  props.featuresFromDB.map((f) => Math.floor((f.value % 100) / 10))
);

// 他ユーザー視点の値（1の位）
const otherViewValues = ref<number[]>(
  props.featuresFromDB.map((f) => f.value % 10)
);

// アクセス許可/不可の値（百の位）
const accessValues = ref<number[]>(
  props.featuresFromDB.map((f) => Math.floor(f.value / 100))
);

// 無効化する条件をチェックする関数 name準拠
const isDisabled = (name: string) => {
  return ['data', 'relation', 'chara'].includes(name);
};

// 変更を監視する
watch(
  () => props.featuresFromDB,
  (newFeatures) => {
    console.log(newFeatures);
    emit('change-menu', newFeatures);
  },
  { deep: true }
);

// 入力時に変更を通知する
const handleChange = (index: number) => {
  // 他ユーザー視点の値が1以上の場合、アクセス許可/不可の値を強制的に1（許可）に設定
  if (otherViewValues.value[index] >= 1) {
    accessValues.value[index] = 1;
  }

  // 3桁の数字を結合してvalueを更新 (百の位)+(10の位)+(1の位)
  props.featuresFromDB[index].value = Number(
    `${accessValues.value[index]}${selfViewValues.value[index]}${otherViewValues.value[index]}`
  );
  emit('change-menu', props.featuresFromDB);
};

// アクセス許可/不可をトグルする
const toggleAccess = (index: number) => {
  // 他ユーザー視点の値が1以上の場合、変更を許可しない
  if (otherViewValues.value[index] >= 1) return;

  accessValues.value[index] = accessValues.value[index] === 1 ? 9 : 1;
  handleChange(index);
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
const labels = ['プロフィール', 'ヒストリー', '未実装', '未実装', '未実装'];
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
  width: 100%;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.feature span {
  width: 100px;
  height: 30px;
  font-size: 0.8rem;
  font-weight: bold;
}

.value-input {
  width: 30px;
}

.title-input {
  width: 70px;
}

.feature input:disabled {
  background-color: #e0e0e0;
  color: #888;
}

button {
  margin-left: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--page-buttontext);
  background-color: var(--page-button);
}

button.active {
  color: var(--page-buttontext);
  background-color: var(--page-button);
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}
</style>
