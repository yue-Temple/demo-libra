<template>
  <Deleteaccountpopup
    v-if="isDeleteAccountPopup"
    @close="deleteAccountpopupClose"
  />
  <!-- トリミング画面（全画面表示） -->
  <ImageCropper
    v-if="isCropping"
    :original-image="originalImage"
    @cancel="channelCropping"
    @cropped="handleCroppedImage"
  />
  <div class="user-section">
    <!-- ユーザーアイコンセクション -->
    <div class="user-icon-section">
      <h2>ユーザー情報の変更</h2>
      <span>❏ユーザーアイコン設定</span>
      <div>
        <!-- プレビュー画像 -->
        <div v-if="previewImage != ''" class="preview-container">
          <img :src="previewImage" alt="プレビュー画像" class="preview-image" />
        </div>
        <br />

        <!-- 画像選択 -->
        <fileupload
          :title="''"
          :select="pictureOption"
          @uploadfile="imageSet"
        />
      </div>
    </div>

    <!-- ユーザー名セクション -->
    <div class="user-name-section">
      <span>❏ユーザー名設定</span>
      <div class="user-info">
        <!-- 名前を入力 -->
        <input
          :value="userName"
          @input="onInput"
          placeholder="ユーザー名を入力"
        />
      </div>
    </div>

    <!-- 登録情報セクション -->
    <div class="user-registration-section">
      <span>❏登録情報</span>
      <div>
        <span>メールアドレス　　　:</span>
        <span>{{ maskedEmail }}</span>
      </div>
      <div>
        <span>グーグルアカウント　:</span>
        <span>{{ googleLinked ? '連携済み' : '連携なし' }}</span>
      </div>
    </div>

    <p>❏アカウントの削除</p>
    <button class="delete-account" @click="deleteAccountpopupOpen">
      <i class="pi pi-trash"></i>アカウントを削除する
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import 'cropperjs/dist/cropper.css';
import ImageCropper from '../sharecomponents/ImageCropper.vue';
import Fileupload from '../sharecomponents/Fileupload.vue';
import Deleteaccountpopup from './deleteaccountpopup.vue';

// Emits の定義
const emit = defineEmits<{
  (event: 'update:usericon', file: File): void;
  (event: 'update:userName', value: string): void;
}>();

const props = defineProps({
  userName: {
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userGoogle: {
    type: String,
    required: true,
  },
  userIcon: {
    type: String,
    required: true,
  },
});

// トリミング,画像処理
const pictureOption = ref('upload'); // アップロードOR貼り付け
const isCropping = ref(false); // トリミング中かどうかのフラグ
const originalImage = ref(''); // オリジナルの画像を保持（再トリミング用）
const previewImage = ref<string>(props.userIcon); //トリミング後、プレビューURL

const isDeleteAccountPopup = ref(false);

// ユーザー名入力時の処理
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:userName', target.value); // 親に新しい値を送信
};

// メールアドレスをマスクする computed プロパティ
const maskedEmail = computed(() => {
  return props.userEmail ? `${props.userEmail.slice(0, 2)}***@***` : '未登録';
});

// googleアカウント連携確認
let googleLinked = false;
if (props.userGoogle != '') {
  googleLinked = true;
}

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
  isCropping.value = false;
};

// トリミング完了リッスン
const handleCroppedImage = (previewUrl: string, file: File) => {
  previewImage.value = previewUrl;
  isCropping.value = false;
  emit('update:usericon', file);
};

// アカウント削除ポップアップ
const deleteAccountpopupOpen = () => {
  isDeleteAccountPopup.value = true;
};
const deleteAccountpopupClose = () => {
  isDeleteAccountPopup.value = false;
};
</script>

<style scoped>
h2 {
  margin-top: 0;
}
.user-section {
  margin-bottom: 20px;
}
.user-icon-section,
.user-name-section,
.user-registration-section {
  margin-bottom: 40px;
}

/* 画像プレビュー */
.preview-container {
  margin-top: 10px;
}
.preview-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid #ccc;
}
p {
  margin-bottom: 0.5rem;
}
.delete-account {
  display: flex;
  align-items: center;
  border: brown solid 1px;
  border-radius: 4px;
  color: brown;
  font-weight: bold;
  padding: 5px;
  font-size: 1rem;
  cursor: pointer;
}
.delete-account:hover {
  border: brown solid 1px;
  color: white;
  background-color: brown;
}
</style>
