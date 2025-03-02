<template>
  <div class="popup" v-if="isVisible">
    <!-- トリミング画面（全画面表示） -->
    <ImageCropper
      v-if="isCropping"
      :original-image="originalImage"
      @cancel="channelCropping"
      @cropped="handleCroppedImage"
    />

    <!-- 通常のポップアップ内容 -->
    <div v-else class="popup-content">
      <div class="h2-cancel">
        <!-- 見出し -->
        <h2 :aria-live="isVisible ? 'polite' : 'off'">
          {{ updateHistory ? '編集' : '新規作成' }}
        </h2>
        <!-- キャンセルボタン -->
        <button class="cancel" @click="closePopup">✖</button>
      </div>

      <div class="scrollable-content">
        <form @submit.prevent="submitForm">
          <!-- タイトル入力 -->
          <div class="form-group">
            <label for="title">▾タイトル</label>
            <input
              type="text"
              id="title"
              v-model="title"
              placeholder="New History"
            />
          </div>
          <!-- サブタイトル入力 -->
          <div class="form-group">
            <label for="title">▾サブタイトル</label>
            <input
              type="text"
              id="system"
              v-model="system"
              placeholder="(任意)"
            />
          </div>
          <!-- 日付選択 -->
          <div class="form-group">
            <DatePicker v-model="selectedDates" />
          </div>
          <!-- レポート入力 -->
          <div class="form-group">
            <label for="report">▾レポート</label>
            <textarea id="report" v-model="report"></textarea>
          </div>
          <!-- 画像選択 -->
          <div class="form-group">
            <fileupload
              :title="'▾ フォト'"
              :select="pictureOption"
              @uploadfile="imageSet"
            />
            <!-- プレビュー画像 -->
            <div v-if="previewImage" class="preview-container">
              <img
                :src="previewImage"
                alt="プレビュー画像"
                class="preview-image"
                @click="startCropping"
              />
            </div>
          </div>

          <hr />
          <div class="form-buttom">
            <!-- 公開/非公開の選択 -->
            <label class="checkbox-label">
              <input type="checkbox" v-model="isPrivate" /> 🔒非公開
            </label>
            <!-- 公開/非公開の選択 -->
            <div class="form-actions">
              <!-- 消去ボタン -->
              <button
                v-if="updateHistory"
                @click="deletehistory"
                class="delete"
                type="button"
              >
                <b>削除</b>
              </button>
              <!-- 追加ボタン -->
              <button
                class="ok"
                v-if="!updateHistory"
                @click="submitForm"
                type="button"
              >
                <b>追加</b>
              </button>
              <!-- 更新ボタン -->
              <button
                class="ok"
                v-if="updateHistory"
                @click="submitForm"
                type="button"
              >
                <b>更新</b>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onUnmounted, watch } from 'vue'; // watchEffect をインポート
import 'cropperjs/dist/cropper.css';
import ImageCropper from '../sharecomponents/ImageCropper.vue';
import { useToast } from 'vue-toastification';
//ストア
import { useHistoryStore } from '@/stores/historyStore';
// コンポーネント
import DatePicker from './DatePicker.vue';
import Fileupload from '../sharecomponents/Fileupload.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  updateHistory: {
    type: Boolean,
    required: false,
  },
  container: {
    type: Object,
    required: false,
    default: () => ({}), // デフォルト値を空のオブジェクトに設定
  },
  sortOrder: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'delete']);
const historyStore = useHistoryStore();
const toast = useToast();
// 入力
const selectedDates = ref<string[]>([]); // 日付は文字列配列と明示
const title = ref('');
const system = ref('');
const report = ref('');
const imgURL = ref('');
const isPrivate = ref(false);

// トリミング,画像処理
const pictureOption = ref('upload'); // アップロードOR貼り付け
const isCropping = ref(false); // トリミング中かどうかのフラグ
const originalImage = ref(props.container.imgURL); // オリジナルの画像を保持（再トリミング用）
const previewImage = ref(props.container.imgURL); //トリミング後、プレビューURL
const uploadFile = ref<File | null>(null); //トリミング後、最終的にR2にアップロードするデータ

// container のデータをフォームの初期値に設定
watchEffect(() => {
  if (props.updateHistory && props.container) {
    selectedDates.value = props.container.date || []; // 日付
    title.value = props.container.title || ''; // タイトル
    system.value = props.container.system || ''; // サブタイトル
    report.value = props.container.report || ''; // レポート
    imgURL.value = props.container.imgURL || ''; // 画像URL
    isPrivate.value = props.container.private || false; // 非公開フラグ
  }
});

watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) disableBodyScroll();
    else enableBodyScroll();
  }
);

// 画像選択/貼り付け時
const imageSet = (image: string, selct: string) => {
  // プレビュー用にセット
  previewImage.value = image;
  originalImage.value = image;
  pictureOption.value = selct; //ラジオボタン選択反映
  //トリミングスタート
  startCropping();
};

// トリミング開始リッスン
const startCropping = () => {
  isCropping.value = true;
};

// トリミングキャンセルリッスン
const channelCropping = () => {
  // previewImage.value = '';
  // originalImage.value = '';
  isCropping.value = false;
};

// トリミング終了リッスン
const handleCroppedImage = (previewUrl: string, file: File) => {
  previewImage.value = previewUrl;
  imgURL.value = previewUrl;
  uploadFile.value = file;
  isCropping.value = false;
};

// body の overflow を制御する関数
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
};
const enableBodyScroll = () => {
  document.body.style.overflow = '';
};
onUnmounted(() => {
  enableBodyScroll(); // コンポーネントがアンマウントされたときにスクロールを有効にする
});

// 変更前のデータを保持
const oldHistory =
  props.updateHistory && props.container
    ? {
        id: props.container.id,
        date: props.container.date || [],
        keydate: props.container.date[0] || null,
        title: props.container.title || '',
        system: props.container.system || '',
        report: props.container.report || '',
        imgURL: props.container.imgURL || '',
        image_object_key: props.container.image_object_key || '',
        private: props.container.private || false,
        childblock: props.container.childblock || [],
      }
    : null;

// 変更適用後のデータ
const submitForm = async () => {
  const newHistory = {
    id: props.container?.id || Date.now().toString(), // 既存のIDを使用または新しいIDを生成
    date: selectedDates.value,
    keydate: selectedDates.value?.[0] || null,
    title: title.value,
    system: system.value,
    report: report.value,
    imgURL: imgURL.value, // 画像を変更した場合ここが変わる
    image_object_key: props.container.image_object_key,
    private: isPrivate.value,
    childblock: props.container?.childblock || [], // 既存のchildblockを使用または空の配列を設定
  };

  // ！編集モードの場合
  if (props.updateHistory && oldHistory) {
    //変更前と変更後のデータを比較
    const isChanged = (
      Object.keys(newHistory) as (keyof typeof newHistory)[]
    ).some((key) => newHistory[key] !== oldHistory[key]);

    // 更新内容のチェック
    // console.log(newHistory)
    // console.log(oldHistory)

    // 変更がなかった場合
    if (!isChanged) {
      toast.success('保存されました');
      console.log('変更がないため、保存をスキップします。');
      emit('close');
      return;

      // 変更があった場合
    } else {
      try {
        await historyStore.updateHistory(
          newHistory,
          uploadFile.value,
          props.container.image_object_key
        ); // 更新APIを呼び出す
        emit('close');
      } catch (error) {
        console.error('更新に失敗しました', error);
        alert('更新に失敗しました');
      }
    }
    // ！新規モードの場合
  } else {
    try {
      await historyStore.addHistory(newHistory, uploadFile.value); // 追加APIを呼び出す
      emit('close');
    } catch (error) {
      console.error('新規追加に失敗しました', error);
      alert('新規追加に失敗しました');
    }
  }
};

// ポップアップを閉じる
const closePopup = () => {
  emit('close');
  return;
};

// 記録データを削除する
const deletehistory = async () => {
  const isConfirmed = confirm('記録を削除します。本当によろしいですか？');
  if (isConfirmed) {
    try {
      emit('delete', props.container.id, props.container.image_object_key); // 親コンポーネントに削除を通知
      emit('close'); // ポップアップを閉じる
    } catch (error) {
      console.error('削除に失敗しました', error);
      alert('削除に失敗しました');
    }
  }
};
</script>

<style scoped>
/* ポップアップウィンドウ */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}
.popup-content {
  background-color: var(--page-background);
  padding: 20px;
  border-radius: 5px;
  width: 500px; /* ポップアップの幅を設定 */
  max-width: 65dvw;
  height: 600px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 2px 2px var(--shadow),
    0 -2px 2px var(--shadow),
    2px 0 2px var(--shadow),
    -2px 0 2px var(--shadow); /* 四方に影 */
}
@media (max-width: 600px) {
  .popup-content {
    margin-top: 40px;
    width: 80dvw;
    max-width: 80dvw;
    max-height: 75vh;
  }
}

/* スクロール可能部分 */
.scrollable-content {
  overflow-y: auto; /* スクロール可能にする */
  flex-grow: 1; /* 残りのスペースを埋める */
  padding: 5px;
}
/* スクロールバーのスタイル */
.scrollable-content::-webkit-scrollbar {
  width: 0px; /* スクロールバーの幅 */
}

/* 見出し */
h2 {
  margin: 0px;
  margin-left: 1rem;
  padding-top: 3.5px;
}
.h2-cancel {
  display: flex;
}
/* 閉じるボタンのスタイル */
.cancel {
  color: var(--page-button);
  background-color: transparent;
  border: none;
  font-size: 1.7rem;
  cursor: pointer;
  margin-left: auto;
  padding-top: 0px;
}
.cancel:hover {
  color: var(--page-button-sub);
}

/* 各フォーム */
.form-group {
  margin-left: 0rem;
  margin-bottom: 18px;
}
.form-group textarea {
  resize: none;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  min-height: 100px;
  margin-bottom: -0.5rem;
}
.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
}
.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 非公開チェックボックス */
.checkbox-label input {
  width: auto;
  margin: 0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 5px;
}

/* 決定・更新ボタン */
.ok {
  background-color: var(--page-button);
  color: var(--page-buttontext);
}
/* 消去ボタンのスタイル */
.delete {
  background-color: #ccc;
}

/* 画像プレビュー */
.preview-container {
  margin-top: 10px;
}
.preview-image {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
