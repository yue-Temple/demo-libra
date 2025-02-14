<template>
  <div :class="['text-button', styleType]">
    <!-- 編集モード -->
    <template v-if="isEditing">
      <div class="button-and-text">
        <button @click.stop="handleImageClick" class="rounded-button">
          <!-- 画像をボタンの中央にトリミングして表示 -->
          <div class="image-container">
            <img
              v-if="button.image_url"
              :src="getImageSrc(button.image_url)"
              alt="Button Image"
              class="button-image"
            />
          </div>
        </button>
        <!-- text編集中OFF -->
        <div class="title-and-content" v-if="isEditing && !editNow">
          <h3 class="textbutton-title">{{ button.title }}</h3>
          <div class="moov">
            <div
              :class="['content', { 'content-empty': isEmptyContent }]"
              v-html="formatContent2(content)"
            ></div>
          </div>
        </div>

        <!-- text編集中ON -->
        <div class="title-and-content" v-if="isEditing && editNow">
          <input maxlength="20" v-model="button.title" placeholder="タイトル" />
          <div class="moov">
            <textarea
              maxlength="100"
              ref="textareaRef"
              v-model="editedContent"
            />
          </div>
        </div>
      </div>

      <!-- ドロップダウン -->
      <div v-if="isEditing && activeDropdown" class="dropdown">
        <span @click.stop="openButtonConfigurator">詳細設定</span>
      </div>
    </template>

    <!-- ビュー -->
    <template v-else>
      <button @click.stop="handleImageClick" class="rounded-button">
        <div class="image-container">
          <img
            v-if="button.image_url"
            :src="getImageSrc(button.image_url)"
            alt="Button Image"
            class="button-image"
          />
        </div>
      </button>
      <div class="title-and-content">
        <h3 class="textbutton-title">{{ button.title }}</h3>
        <div
          @click="startEditing"
          v-html="formatContent2(content)"
          class="content"
        ></div>
      </div>
    </template>
  </div>

  <div class="editblock" v-if="isEditing">
    <!-- 入力欄 -->
    <div class="input-container" v-if="editNow">
      <input v-model="button.link_url" placeholder="URL" />
    </div>
    <div class="editflag">
      <!-- 編集モード（ブロック外） -->
      <div v-if="!editNow">
        <button @click="startEditing">✍編集</button>
      </div>

      <!-- 編集中ON（ブロック外） -->
      <div v-if="editNow"> 
        <button @click="cancelEditing">✖キャンセル</button>
        <button @click="stopEditing">✓決定</button>
      </div>
    </div>

    <!-- ボタン詳細設定のポップアップ -->
    <div v-if="showConfigurator" class="popup">
      <!--  @update:coverfileはファイルアップロード時のみ発火 -->
      <ButtonConfigurator
        :cover="button.image_url || null"
        :icon="button.icon_url || null"
        :titlecolor="validateTitleColor(button.title_color)"
        @update:cover="updateCover"
        @update:icon="updateIcon"
        @update:titlecolor="updateTitleColor"
        @close="closeButtonConfigurator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { Button } from '@sharetypes';
import { formatContent2 } from '@/rogics/textformat';
import ButtonConfigurator from './ButtonConfigurator.vue';

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  editNow: {
    type: Boolean,
    default: false,
  },
  styleType: {
    type: String,
    default: 'solid', // デフォルトのスタイルタイプ
  },
  content: {
    type: String,
    required: true,
  },
  button: {
    type: Object as () => Button,
    required: true,
  },
});

const emit = defineEmits(['update:editNow', 'update:content', 'update:button']);

const editedContent = ref(props.content);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const activeDropdown = ref(false);
const showConfigurator = ref<boolean>(false);

// ボタンタイトルの色
type TitleColor = string; // 型を string に拡張
const validTitleColors: TitleColor[] = ['black', 'white', 'main']; // 有効な値のリスト
const validateTitleColor = (color: string | null): TitleColor => {
  return color && validTitleColors.includes(color) ? color : 'main'; // デフォルト値は 'main'
};

// ドロップダウンの表示・非表示を切り替える
const toggleDropdown = () => {
  activeDropdown.value = !activeDropdown.value;
};
const handleDocumentClick = (event: MouseEvent) => {
  const dropdown = (event.target as HTMLElement).closest('.dropdown');
  if (!dropdown) {
    activeDropdown.value = false;
  }
};

// 共通処理を抽出
// ※キーをButtonのプロパティに制限<K extends keyof Button>
// ※値の型を自動的に対応するプロパティの型に value: Button[K]
const updateButtonProperty = <K extends keyof Button>(
  key: K,
  value: Button[K]
) => {
  const newButton = props.button;
  newButton[key] = value;
  emit('update:button', newButton);
};

// 利用
const updateCover = (newImageUrl: File) => {
  updateButtonProperty('image_url', newImageUrl);
};
const updateIcon = (newIcon: string) => {
  updateButtonProperty('icon_url', newIcon);
};
const updateTitleColor = (newTitleColor: TitleColor) => {
  updateButtonProperty('title_color', newTitleColor);
};

// ボタン詳細設定を開く
const openButtonConfigurator = () => {
  showConfigurator.value = true; // ButtonConfigurator を表示
};
// ボタン詳細設定を閉じる
const closeButtonConfigurator = () => {
  showConfigurator.value = false;
};

// ボタンクリック（isEditing=true）:詳細設定ドロップダウンを開く
const handleImageClick = () => {
  if (props.isEditing) {
    toggleDropdown();
  } else {
    handleButtonClick(props.button.link_url);
  }
};

// ボタンクリック（isEditing=false）:URLに遷移
const handleButtonClick = (url: string | null | undefined) => {
  // 編集モードでない場合は処理をスキップ
  if (props.isEditing) return;

  // URLが無効または未定義の場合も処理をスキップ
  if (!url) return;

  // URLが正しい形式の場合、新しいタブで開く
  if (isValidUrl(url)) {
    window.open(url, '_blank');
  } else {
    console.log('無効なURLです。');
    return;
  }
};

// URLのバリデーション
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url); // URLオブジェクトを作成して検証
    return true;
  } catch (error) {
    return false;
  }
};

// 画像URLを取得する関数
const getImageSrc = (imageUrl: string | File): string | undefined => {
  if (typeof imageUrl === 'string') {
    return imageUrl;
  } else if (imageUrl instanceof File) {
    return URL.createObjectURL(imageUrl); // File型の場合はBlob URLを生成
  }
  return undefined;
};

// テキスト処理
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
  document.addEventListener('click', handleDocumentClick);
  adjustTextareaHeight();
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.text-button {
  margin: 5px auto;
  display: flex;
  width: 60%;
}
@media (max-width: 600px) {
  .text-button {
    margin: 5px auto;
    width: 85%;
  }
  .editblock {
    margin-left: 1dvw;
  }
}

/* テキスト種類別スタイル */
.none {
  border: none;
}
.solid {
  border: 1.5px solid var(--page-text);
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
  margin-bottom: -25px;
  font-size: clamp(12px, 5vw, 20px);
}

/* 編集ボタン */
.editblock {
  margin-top: -3px;
}
.input-container {
  display: flex; /* 子要素を横並びに */
  justify-content: flex-end; /* 全体を右寄せ */
  margin-right: 20%;
  margin-top: 0px;
}
.input-container input {
  justify-self: flex-start; /* 全体を右寄せ */
  width: 350px;
}
.editflag {
  display: flex; /* 子要素を横並びに */
  justify-content: flex-end; /* 全体を右寄せ */
  margin-right: 20%;
  margin-top: 0px;
}
.editflag button {
  color: var(--page-text-sub);
  font-size: small;
  background: none; /* 背景を消す */
  border: none; /* 枠線を消す */
  cursor: pointer; /* ホバー時にカーソルを指アイコンにする */
}

@media (max-width: 600px) {
  .editblock {
    align-items: flex-start;
    margin-left: 7dvw;
    width: 100%;
  }
  .input-container {
    margin-right: 15dvw;
  }
  .input-container input {
    width: 260px;
  }
  .editflag {
    justify-self: flex-end; /* 全体を右寄せ */
    margin-right: 15dvw;
  }
}

/* ボタン */
.rounded-button {
  margin: 0.5rem;
  width: calc(100% / 4 - 10px);
  padding-top: calc(100% / 4 - 10px);
  height: calc(100% / 4 - 10px);
  border-radius: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;
  /* シャドウを追加 */
  box-shadow:
    0px 2px 4px var(--shadow),
    0px 1px 3px var(--shadow);
}
.button-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* アスペクト比を維持してトリミング */
}

/* 画像をボタンの中央にトリミングして表示 */
.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px; /* ボタンの角丸に合わせる */
}

/* ボタンとテキスト */
.button-and-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
}
.title-and-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.textbutton-title,
.title-and-content input {
  font-size: clamp(12px, 2.5vw, 27px);
  font-weight: bolder;
  white-space: nowrap;
  height: 20%;
  margin-bottom: 0.5rem;
  margin: 0.4rem;
}
.textbutton-title {
  margin-left: 0.8rem;
}

.moov,
.content {
  height: 100%;
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
}

.moov .content,
.moov textarea {
  width: 100%;
  font-size: clamp(12px, 3vw, 18px);
  resize: none;
  overflow: hidden;
  box-sizing: border-box;
  word-break: break-word;
  white-space: normal;
}

.moov .content {
  display: flex;
  align-items: center;
}

.moov textarea {
  min-height: 65px;
}

@media (max-width: 600px) {
  .textbutton-title,
  .title-and-content input {
    margin-bottom: 0;
    font-size: clamp(15px, 2vw, 20px);
  }

  .moov .content,
  .moov textarea {
    font-size: clamp(10px, 2vw, 18px);
    min-height: 35px;
  }
}

/* ドロップダウン */
.dropdown {
  position: absolute;
  top: 0%;
  left: 26.7%;
  color: black;
  font-size: clamp(0.8rem, 2.5vw, 15px);
  background-color: white;
  border: 1px solid #ccc;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
  width: auto;
  white-space: nowrap;
  max-width: 200px;
  overflow-wrap: break-word;
  margin-top: 5px;
}

.upload-button {
  display: none;
}
</style>
