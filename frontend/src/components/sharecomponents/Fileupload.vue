<template>
  <div class="title-radio">
    <label>{{ title }}</label>
    <div class="radio-group">
      <span>（画像選択</span>
      <input
        type="radio"
        name="pictureType"
        value="upload"
        v-model="pictureOption"
      />
      <span>　貼り付け</span>
      <input
        type="radio"
        name="pictureType"
        value="copy"
        v-model="pictureOption"
      />
      <span>）</span>
    </div>
  </div>

  <!-- ファイルアップロード用の input -->
  <label
    v-if="pictureOption === 'upload'"
    for="fileUpload"
    class="file-upload-label"
  >
    ファイルを選択
    <input
      type="file"
      id="fileUpload"
      @change="handleFileUpload"
      class="file-upload-input"
    />
  </label>

  <!-- クリップボードから貼り付け用のボタン -->
  <label
    v-if="pictureOption === 'copy'"
    class="file-upload-label"
    @click="handlePasteFromClipboard"
  >
    クリップボードから貼り付け
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String, // ▾〇〇に入る文字
    required: true,
  },
  select: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['uploadfile']);

const pictureOption = ref(props.select);
const picture = ref('');
const reader = new FileReader();

// ファイルアップロード処理
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // filをDataURLに変換
  reader.onload = (e) => {
    if (e.target?.result) {
      picture.value = e.target.result as string;
      emit('uploadfile', picture.value, 'upload');
    }
  };
  reader.readAsDataURL(file);
};

// クリップボードからの貼り付け処理 ※スクリプトで生成した画像・データ
const handlePasteFromClipboard = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();

    for (const clipboardItem of clipboardItems) {
      // 画像タイプのデータを探す
      const imageType = clipboardItem.types.find((type) =>
        type.startsWith('image/')
      );
      if (!imageType) continue;

      // Blobデータを取得
      const blob = await clipboardItem.getType(imageType);

      // BlobをDataURLに変換
      reader.onload = (e) => {
        if (e.target?.result) {
          picture.value = e.target.result as string;
          emit('uploadfile', picture.value, 'copy');
        }
      };
      reader.readAsDataURL(blob);
      return;
    }

    alert('クリップボードに画像が見つかりませんでした');
  } catch (error) {
    console.error('クリップボードアクセスエラー:', error);
    alert('クリップボードへのアクセスに失敗しました');
  }
};
</script>

<style scoped>
/* ファイルアップロードボタン */
.file-upload-label {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--page-button); /* ボタンの背景色 */
  color: var(--page-buttontext); /* ボタンのテキスト色 */
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 0.5rem;
}
.file-upload-label:hover {
  background-color: var(--page-button-sub); /* ホバー時の背景色 */
}
.file-upload-input {
  display: none; /* デフォルトの入力フィールドを非表示にする */
}

/* ラジオボタン */
.radio-group {
  width: 100%;
  display: flex;
  gap: 5px;
  font-size: 0.8rem;
}
.radio-group span {
  margin-top: 0px;
}
.radio-group input {
  margin: 0;
  padding: 1rem;
}
</style>
