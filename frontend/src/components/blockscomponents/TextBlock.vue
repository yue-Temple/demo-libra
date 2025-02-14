<template>
  <div :class="['text-block', styleType]">
    <!-- 編集モード -->
    <template v-if="isEditing">
      <!-- text編集中OFF -->
      <div
        v-if="isEditing && !editNow"
        :class="['content', { 'content-empty': isEmptyContent }]"
        v-html="formatContent4(content)"
      ></div>

      <!-- text編集中ON -->
      <textarea
        v-if="isEditing && editNow"
        ref="textareaRef"
        v-model="editedContent"
        @input="adjustTextareaHeight"
      />
    </template>

    <!-- ビュー -->
    <template v-else>
      <div v-html="formatContent4(content)" class="content"></div>
    </template>
  </div>

  <div class="editblock">
    <!-- 編集モード（ブロック外） -->
    <div v-if="isEditing && !editNow">
      <button @click="startEditing">✍編集</button>
    </div>

    <!-- 編集中ON（ブロック外） -->
    <div v-if="isEditing && editNow">
      <button @click="stopEditing">✓決定</button>
      <button @click="cancelEditing">✖キャンセル</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { StyleType } from '@sharetypes';
import { formatContent4 } from '@/rogics/textformat';

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: true,
  },
  editNow: {
    type: Boolean,
    required: true,
    default: false,
  },
  styleType: {
    type: String as () => StyleType,
    default: 'none',
  },
  content: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:editNow', 'update:content']);

const editedContent = ref(props.content);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// 編集開始
const startEditing = () => {
  if (!props.editNow) {
    emit('update:editNow', true); // 親に通知
  }
  nextTick(() => {
    adjustTextareaHeight();
  });
};
// 編集終了
const stopEditing = () => {
  if (props.editNow) {
    emit('update:content', editedContent.value); // 親に通知
    emit('update:editNow', false); // 親に通知
  }
};
// 編集中断
const cancelEditing = () => {
  if (props.editNow) {
    editedContent.value = props.content; // 編集内容をリセット
    emit('update:editNow', false); // 親に通知
  }
};

// コンテンツが空かどうかを判定
const isEmptyContent = computed(() => {
  return !props.content || props.content.trim() === '';
});

// テキストエリアの高さを自動調整する関数
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto'; // 一旦高さをリセット
    textarea.style.height = `${textarea.scrollHeight}px`; // スクロール高さに合わせて調整
  }
};

// コンポーネントマウント時に初期高さを調整
onMounted(() => {
  adjustTextareaHeight();
});
</script>

<style scoped>
.text-block {
  margin: 5px auto;
  margin-bottom: 0;
  width: 60%;
}
@media (max-width: 600px) {
  .text-block {
    width: 85%;
  }
}
/* 種類別スタイル */
.none {
  border: none;
}
.solid {
  border: 1px solid var(--page-text);
}
.dashed {
  border: 1px dashed var(--page-text);
}
.double {
  border: 4px double var(--page-text);
}

::v-deep h1,
::v-deep h2,
::v-deep h3,
::v-deep h4,
::v-deep h5,
::v-deep h6 {
  margin-top: 0px;
}

.content {
  padding: 5px;
  max-width: 100%;
  font-size: clamp(12px, 2.5vw, 18px);
}
/* コンテンツが空の場合のスタイル */
.content:empty {
  padding: 0px;
  margin: 0px;
}

/* 入力エリア */
textarea {
  padding: 8px;
  border: 1px solid #ccc;
  font-size: 0.85rem;
  border-radius: 4px;
  position: relative;
  width: 100%; /* 親要素に合わせた幅 */
  height: 100%;
  top: 2px;
  transform: scale(99%); /* 1%縮小 */
  transform-origin: center; /* 中央を基準に縮小 */
  resize: none; /* ユーザーによるリサイズを禁止 */
  overflow: hidden; /* スクロールバーを非表示 */
  box-sizing: border-box; /* パディングを含めた幅と高さ */
  word-wrap: break-word; /* 長い単語を適切に折り返す */
  word-break: break-word; /* 長い文字列を途中で折り返す */
}

/* 編集ボタン */
.editblock {
  display: flex; /* 子要素を横並びに */
  justify-content: flex-end; /* 全体を右寄せ */
  margin-right: 20%;
  margin-top: 0px;
}
.editblock button {
  color: var(--page-text-sub);
  font-size: small;
  background: none; /* 背景を消す */
  border: none; /* 枠線を消す */
  cursor: pointer; /* ホバー時にカーソルを指アイコンにする */
}
@media (max-width: 600px) {
  .editblock {
    margin-right: 8%;
  }
}
</style>
