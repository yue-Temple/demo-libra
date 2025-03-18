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
        <!-- タイトルカラー選択 -->
        <div class="form-group">
          <label>▾ タイトルカラー選択</label><br />
          <div class="color-panel">
            <div
              v-for="color in colorList"
              :key="color.value"
              :class="[
                'color-item',
                { active: selectedTitleColor === color.value },
              ]"
              @click="selectTitleColor(color.value)"
            >
              <div :style="{ backgroundColor: color.style }"></div>
              <span>{{ color.label }}</span>
            </div>
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
          <label>▾ アイコンカラー選択</label><br />
          <div class="color-panel">
            <div
              v-for="color in colorList"
              :key="color.value"
              :class="[
                'color-item',
                { active: selectedIconColor === color.value },
              ]"
              @click="selectIconColor(color.value)"
            >
              <div :style="{ backgroundColor: color.style }"></div>
              <span>{{ color.label }}</span>
            </div>
          </div>
          <br />
          <label>▾ アイコン画像選択</label><br />
          <div class="icon-panel">
            <div
              v-for="icon in iconList"
              :key="icon.value"
              :class="['icon-item', { active: selectedIcon === icon.value }]"
              @click="selectIcon(icon.value)"
            >
              <i :class="`pi ${icon.value}`"></i>
            </div>
          </div>
          <br />
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
</template>

<script setup lang="ts">
import { ref, PropType, onMounted } from 'vue';
import ImageCropper from '../sharecomponents/ImageCropper.vue';
import Fileupload from '../sharecomponents/Fileupload.vue';

const props = defineProps({
  cover: {
    type: [String, File] as PropType<string | File | null>,
    required: false,
    default: null,
  },
  icon: {
    type: Object as () => { iconClass: string; iconStyle: string } | null,
    required: false,
    default: null,
  },
  titlecolor: {
    type: String as () => string,
    required: false,
  },
});

const emit = defineEmits([
  'update:titlecolor',
  'update:cover',
  'update:icon',
  'close',
]);

const selectedTitleColor = ref(props.titlecolor || 'main');

// トリミング関連の状態
const pictureOption = ref('upload'); // アップロードOR貼り付け
const isCropping = ref(false); // トリミング中かどうかのフラグ
const originalImage = ref(''); // オリジナルの画像を保持（再トリミング用）
const previewImage = ref(''); //トリミング後、プレビューURL
const uploadcoverFile = ref<File | null>(null); //トリミング後、画像データ

// 選択されたアイコンと色
const selectedIcon = ref<string | null>(null);
const selectedIconColor = ref<string>('main');

// iconプロパティから初期値を設定
onMounted(() => {
  if (props.icon) {
    // selectedIconの初期値設定
    selectedIcon.value = props.icon.iconClass.replace('pi ', '');

    // selectedIconColorの初期値設定
    const colorMatch = props.icon.iconStyle.match(/color:\s*([^;]+)/);
    if (colorMatch && colorMatch[1]) {
      selectedIconColor.value = colorMatch[1].trim();
    }
  }
});

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

// タイトルカラーを選択
const selectTitleColor = (color: string) => {
  selectedTitleColor.value = color;
  emit('update:titlecolor', color);
};

// アイコンリスト
const iconList = [
  // 一般的なアイコン
  { value: '', label: 'なし' },
  { value: 'pi-envelope', label: 'メール' },
  { value: 'pi-send', label: '送信' },
  { value: 'pi-share-alt', label: '共有' },

  { value: 'pi-heart', label: 'ハート' },
  { value: 'pi-heart-fill', label: 'ハート（塗りつぶし）' },
  { value: 'pi-star', label: '星' },
  { value: 'pi-star-fill', label: '星（塗りつぶし）' },

  { value: 'pi-phone', label: '電話' },
  { value: 'pi-camera', label: 'カメラ' },
  { value: 'pi-video', label: '動画' },
  { value: 'pi-palette', label: 'パレット' },

  { value: 'pi-address-book', label: 'アドレス帳' },
  { value: 'pi-book', label: '本' },
  { value: 'pi-bookmark', label: 'ブックマーク' },
  { value: 'pi-tag', label: 'タグ' },

  { value: 'pi-map-marker', label: '位置情報' },
  { value: 'pi-cog', label: '設定' },
  { value: 'pi-comment', label: 'コメント' },
  { value: 'pi-search', label: '検索' },

  { value: 'pi-user', label: 'ユーザー' },
  { value: 'pi-calendar', label: 'カレンダー' },
  { value: 'pi-cart-minus', label: 'カート' },
  { value: 'pi-chart-bar', label: 'チャート' },

  { value: 'pi-globe', label: '地球' },
  { value: 'pi-moon', label: '月' },
  { value: 'pi-sun', label: '太陽' },
  { value: 'pi-bolt', label: '稲妻' },

  { value: 'pi-exclamation-triangle', label: '注意' },
  { value: 'pi-crown', label: '王冠' },
  { value: 'pi-trophy', label: 'トロフィー' },
  { value: 'pi-key', label: '鍵' },
  { value: 'pi-lightbulb', label: '電球' },
  { value: 'pi-clock', label: '時計' },
  { value: 'pi-compass', label: 'コンパス' },

  { value: 'pi-face-smile', label: '笑顔' },
  { value: 'pi-copy', label: 'コピー' },
  { value: 'pi-pencil', label: 'ペン' },
  { value: 'pi-home', label: '家' },
  { value: 'pi-building', label: 'ビル' },
  { value: 'pi-building-columns', label: '銀行' },
  { value: 'pi-briefcase', label: 'ブリーフケース' },
  { value: 'pi-flag', label: '旗' },
  { value: 'pi-bell', label: 'ベル' },
  { value: 'pi-hammer', label: 'ハンマー' },

  { value: 'pi-car', label: '車' },
  { value: 'pi-truck', label: 'トラック' },
  { value: 'pi-gift', label: 'ギフト' },
  { value: 'pi-box', label: '箱' },

  { value: 'pi-graduation-cap', label: '卒業帽' },
  { value: 'pi-shield', label: '盾' },
  { value: 'pi-headphones', label: 'ヘッドフォン' },

  // SNS・外部サービス
  { value: 'pi-twitter', label: 'Twitter' },
  { value: 'pi-facebook', label: 'Facebook' },
  { value: 'pi-instagram', label: 'Instagram' },
  { value: 'pi-tiktok', label: 'TikTok' },
  { value: 'pi-discord', label: 'Discord' },
  { value: 'pi-youtube', label: 'YouTube' },
  { value: 'pi-google', label: 'Google' },
  { value: 'pi-amazon', label: 'Amazon' },
  { value: 'pi-pinterest', label: 'Pinterest' },
  { value: 'pi-github', label: 'GitHub' },
  { value: 'pi-vimeo', label: 'Vimeo' },
  { value: 'pi-telegram', label: 'Telegram' },
  { value: 'pi-android', label: 'Android' },
  { value: 'pi-apple', label: 'Apple' },
  { value: 'pi-microsoft', label: 'Microsoft' },
  { value: 'pi-slack', label: 'Slack' },
  { value: 'pi-linkedin', label: 'LinkedIn' },
  { value: 'pi-paypal', label: 'PayPal' },
];

// カラーリスト
const colorList = [
  { value: 'black', label: '黒', style: 'black' },
  { value: 'white', label: '白', style: 'white' },
  { value: 'main', label: 'テーマ', style: 'var(--page-text)' },
];

// アイコンを選択
const selectIcon = (icon: string) => {
  selectedIcon.value = icon;
};

// 色を選択
const selectIconColor = (color: string) => {
  selectedIconColor.value = color;
};

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
    // アップロード：親にカバー画像ファイルとタイトルカラーを渡す
    emit('update:cover', uploadcoverFile.value);
    emit('update:titlecolor', selectedTitleColor.value);

    // アイコンと色を親に伝える
    if (selectedIcon.value) {
      // アイコンが選択されている場合
      const iconClass = `pi ${selectedIcon.value}`;
      const iconStyle = `color: ${selectedIconColor.value === 'main' ? 'var(--page-text)' : selectedIconColor.value}`;
      emit('update:icon', { iconClass, iconStyle });
    } else {
      // アイコンが「なし」の場合
      emit('update:icon', null); // アイコンをクリア
    }

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
  height: 620px;
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
    width: 90dvw;
    max-width: 90dvw;
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
  width: 2px; /* スクロールバーの幅 */
}
/* スクロールバーそのものの色 */
.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--page-text-sub);
  border-radius: 10px; /* つまみの角を丸くする */
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
  margin-top: 2rem;
  margin-right: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 画像リセット */
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

/* アイコンパネルのスタイル */
.icon-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4列のグリッド */
  gap: 10px;
  margin-top: 10px;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.icon-item.active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1); /* 薄い青色 */
}

.icon-item i {
  font-size: 24px;
}

/* カラーパネルのスタイル */
.color-panel {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.color-item div {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.color-item.active div {
  border: #007bff solid 2px;
}

.color-item span {
  margin-top: 5px;
  font-size: 12px;
}

/* 選択されたアイコンのプレビュー */
.selected-icon-preview {
  margin-top: 20px;
  text-align: center;
}

.selected-icon-preview i {
  font-size: 48px;
}
</style>
