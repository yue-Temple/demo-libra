<template>
  <h2>メニューバー設定</h2>
  <!-- Features Guide -->
  <div class="features-guide">
    <span class="g1">機能</span>
    <span class="g2">自分用</span>
    <span class="g3">外部用</span>
    <span class="g4">メニュー<br />タイトル</span>
    <span class="g5">アクセス可否</span>
  </div>

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
  <br />
  <Fieldset legend="ヘルプ">
    <p class="m-0">
      ・「自分/外部用」 それぞれメニューバーの並び順を設定できます。
      <br /><br />
      ・並び順"0"のページはメニューバーに含まれません。
      <br /><br />
      ・自分用"1"のページがあなたの「メインページ」になります。
      <br /><br />
      ・外部用"0"のページは「アクセス可否」を追加で設定可能。
      不可に設定されると、URLを共有しても相手はそのページを閲覧できません。
    </p>
  </Fieldset>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Features } from '@sharetypes';
import Fieldset from 'primevue/fieldset';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const featuresFromDB = [...userStore.features];

// 変更を監視する
watch(
  () => featuresFromDB,
  (newFeatures) => {
    emit('change-menu', newFeatures);
  },
  { deep: true }
);

// Emit の定義
const emit = defineEmits<{
  (e: 'change-menu', features: Features[]): void;
}>();

// 自分視点の値（10の位）
const selfViewValues = ref<number[]>(
  featuresFromDB.map((f) => Math.floor((f.value % 100) / 10))
);

// 他ユーザー視点の値（1の位）
const otherViewValues = ref<number[]>(featuresFromDB.map((f) => f.value % 10));

// アクセス許可/不可の値（百の位）
const accessValues = ref<number[]>(
  featuresFromDB.map((f) => Math.floor(f.value / 100))
);

// 無効化する条件をチェックする関数 name準拠
const isDisabled = (name: string) => {
  return ['data', 'relation', 'chara'].includes(name);
};

// 入力時に変更を通知する
const handleChange = (index: number) => {
  // 他ユーザー視点の値が1以上の場合、アクセス許可/不可の値を強制的に1（許可）に設定
  if (otherViewValues.value[index] >= 1) {
    accessValues.value[index] = 1;
  }

  // 3桁の数字を結合してvalueを更新 (百の位)+(10の位)+(1の位)
  featuresFromDB[index].value = Number(
    `${accessValues.value[index]}${selfViewValues.value[index]}${otherViewValues.value[index]}`
  );
  emit('change-menu', featuresFromDB);
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
    featuresFromDB[index].title = truncatedValue;
  }

  // 変更を通知
  emit('change-menu', featuresFromDB);
};

// ※ラベル（※featuresFromDB配列と同じ長さにすること）
const labels = ['プロフィール', 'ヒストリー', '未実装', '未実装', '未実装'];
</script>

<style scoped>
h2 {
  margin-top: 0;
}

.features-guide {
  display: flex;
  font-size: 0.6rem;
}
.features-guide span {
  display: flex;
  align-items: center; /* 縦方向の中央揃え */
  justify-content: center; /* 横方向の中央揃え（必要なら） */
}
.g1 {
  width: 35%;
  max-width: 100px;
}
.g2,
.g3 {
  width: 40px;
}
.g4 {
  width: 70px;
}
.g5 {
  width: 25%;
  max-width: 60px;
}
/* モバイル */
@media (max-width: 600px) {
  .g2,
  .g3 {
    writing-mode: vertical-rl; /* 縦書き（右から左） */
    width: 20px;
  }
  .g5 {
    width: 40px;
    margin-left: 15px;
  }
}

.features-settings {
  margin-top: 10px;
  margin-bottom: 1.5rem;
  width: 100%;
}

/* PC表示 */
@media (min-width: 600px) {
  .features-guide,
  .features-settings {
    transform: scale(1.2);
    transform-origin: top left; /* 位置を調整 */
  }
  .value-input {
    width: 40px !important;
  }
}

.pagetitle {
  display: flex;
  align-items: center;
  width: 50px;
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

/* モバイルすぴなーOFF */
@media (max-width: 600px) {
  .value-input::-webkit-outer-spin-button,
  .value-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
.value-input {
  width: 20px;
}
.title-input {
  width: 70px;
}

.feature input:disabled {
  background-color: #e0e0e0;
  color: #888;
}
/* アクセス可否ボタン */
button {
  margin-left: 10px;
  cursor: pointer;
  font-size: 0.7rem;
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

.m-0 {
  font-size: 0.8rem;
}
</style>
