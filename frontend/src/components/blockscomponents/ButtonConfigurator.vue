<template>
  <div class="popup">
    <!-- トリミング画面（全画面表示） -->
    <ImageCropper
      v-if="isCropping"
      :original-image="originalImage"
      @cancel="isCropping = false"
      @cropped="handleCroppedImage"
    />

    <!-- 通常のポップアップ内容 -->
    <div v-else class="popup-content">
      <div class="h2-cancel">
        <!-- 見出し -->
        <h2>ボタン詳細設定</h2>
        <!-- キャンセルボタン -->
        <button class="cancel" @click="closePopup">✖</button>
      </div>

      <div class="scrollable-content">
        <!-- タイトルの色選択 -->
        <div class="form-group">
          <div class="title-coolorselect">
            <label>▾ タイトルの文字色</label>
            <select v-model="selectedTitleColor" class="color-selector">
              <option value="black">黒</option>
              <option value="white">白</option>
              <option value="main">メインカラー</option>
            </select>
          </div>
        </div>
        <!-- 画像選択 -->
        <div class="form-group">
          <fileupload
            :title="'▾ カバー画像設定'"
            :select="pictureOption"
            @uploadfile="imageSet"
          />
          <!-- プレビュー画像 -->
          <div class="preview-covercontainer" v-if="previewImage">
            <img
              :src="previewImage"
              class="preview-coverimage"
              @click.stop="startCropping"
            />
          </div>
          <label v-if="previewImage" class="file-reset" @click.stop="fileReset">
            （►画像のリセット）
          </label>
        </div>

        <!-- アイコン画像 -->
        <div class="form-group">
          <label>▾ アイコン画像選択</label><br />
          まだ用意してないよ～<br /><br />
          <hr />
          <!-- <select v-model="selectedIcon" class="icon-selector">
                <option
                  v-for="icon in iconList"
                  :key="icon.value"
                  :value="icon.value"
                >
                  {{ icon.label }}
                </option>
              </select> -->
          <div class="icon-container" v-if="selectedIcon">
            <img :src="selectedIcon" alt="Selected Icon" class="icon-image" />
          </div>
        </div>

        <!-- 保存ボタン -->
        <div class="form-bottom">
          <div class="form-actions">
            <button type="submit" class="ok" @click="saveConfig">
              <b>決定</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import ImageCropper from '../hcomponents/ImageCropper.vue';
import Fileupload from '../sharecomponents/Fileupload.vue';

const props = defineProps({
  cover: {
    type: [String, File] as PropType<string | File | null>,
    required: false,
    default: null,
  },
  icon: {
    type: String as () => string | null,
    required: false,
    default: null,
  },
  titlecolor: {
    type: String as () => string,
    required: false,
    default: 'black',
  },
});

const emit = defineEmits([
  'update:titlecolor',
  'update:cover',
  'update:icon',
  'close',
]);

const selectedTitleColor = ref(props.titlecolor || 'black');
const selectedIcon = ref(props.icon);

// トリミング関連の状態
const pictureOption = ref('upload'); // アップロードOR貼り付け
const isCropping = ref(false); // トリミング中かどうかのフラグ
const originalImage = ref(''); // オリジナルの画像を保持（再トリミング用）
const previewImage = ref(''); //トリミング後、プレビューURL
const uploadcoverFile = ref<File | null>(null); //トリミング後、画像データ

// 画像選択/貼り付け時
const imageSet = (image: string, selct: string) => {
  previewImage.value = image; // プレビュー用にセット
  originalImage.value = image;
  pictureOption.value = selct;
  isCropping.value = true; //トリミングスタート
};

// 推定ケース：決定後再度開く 親から受け取ったFileデータを初期値にセット
if (props.cover instanceof File) {
  originalImage.value = URL.createObjectURL(props.cover);
  previewImage.value = URL.createObjectURL(props.cover);
  uploadcoverFile.value = props.cover;
} else if (typeof props.cover === 'string') {
  originalImage.value = props.cover;
  previewImage.value = props.cover;
}

// アイコンリスト
const iconList = ref([
  { value: '/icons/icon1.png', label: 'アイコン1' },
  { value: '/icons/icon2.png', label: 'アイコン2' },
  { value: '/icons/icon3.png', label: 'アイコン3' },
]);

// トリミング開始　発火メソッド
const startCropping = () => {
  isCropping.value = true;
};

// トリミング終了リッスン
const handleCroppedImage = (previewUrl: string, file: File) => {
  previewImage.value = previewUrl;
  uploadcoverFile.value = file;
  isCropping.value = false;
};

//選択画像リセット処理
const fileReset = async () => {
  originalImage.value = '';
  previewImage.value = '';
  uploadcoverFile.value = null;
};

// 編集を決定
const saveConfig = async () => {
  try {
    // アップロード：親にファイルを渡す
    emit('update:cover', uploadcoverFile.value);
    emit('update:icon', selectedIcon.value);
    emit('update:titlecolor', selectedTitleColor.value);
    emit('close');
  } catch (error) {
    alert('設定の保存に失敗しました');
    console.error('保存エラー:', error);
  }
};

// ポップアップを閉じる
const closePopup = () => {
  emit('close');
};
</script>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  max-height: 70vh;
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
  margin: 0px !important;
  margin-left: 1rem !important;
  padding-top: 3.5px !important;
  font-size: 24px !important;
}
.h2-cancel {
  display: flex;
  margin-bottom: 0.5rem;
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
  margin-bottom: 30px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
  margin-top: -15px;
}
.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* カラー選択 */
.title-coolorselect {
  display: flex;
  flex-direction: column;
}
.color-selector {
  margin-left: 1rem;
  width: 100px;
  padding: 2px;
}
.file-reset {
  color: #ccc;
  font-size: 0.7rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

/* 決定・更新ボタン */
.ok {
  background-color: var(--page-button);
  color: var(--page-buttontext);
}

/* プレビュー画像 カバーとアイコン */
.preview-covercontainer {
  margin-top: 10px;
}
.preview-coverimage {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.icon-container {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 10px;
}
.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
