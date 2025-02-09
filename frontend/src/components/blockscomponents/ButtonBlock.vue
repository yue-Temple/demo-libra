<template>
  <div class="button-block">
    <div class="button-row">
      <div
        v-for="(button, index) in buttons"
        :key="index"
        :class="['button-container', buttonType]"
      >
        <button @click.stop="handleImageClick(index)" class="rounded-button">
          <!-- 画像をボタンの中央にトリミングして表示 -->
          <div class="image-container">
            <img
              v-if="button.image_url"
              :src="getImageSrc(button.image_url)"
              alt="Button Image"
              class="button-image"
            />
          </div>
          <!-- 3ボタン（大）のタイトル表示 -->
          <span
            class="inbutton-title"
            v-if="!isEditing && buttonType === ButtonType.BigThreeButton"
            >{{ button.title }}</span
          >
        </button>
        <!-- 3,4ボタン（小）のタイトル表示 -->
        <span
          class="smallbutton-title"
          v-if="
            !isEditing &&
            (buttonType === ButtonType.SmallThreeButton ||
              buttonType === ButtonType.SmallFourButton ||
              buttonType === ButtonType.SmallOneButton)
          "
          >{{ button.title }}</span
        >

        <!-- ドロップダウン -->
        <div v-if="isEditing && activeDropdown === index" class="dropdown">
          <span @click.stop="openButtonConfigurator(index)">詳細設定</span>
        </div>
      </div>
    </div>

    <!-- 編集中：タイトルとURL -->
    <div v-if="isEditing">
      <!-- トグルボタン -->
      <div class="toggle-buttons">
        <button
          v-for="(button, index) in buttons"
          :key="index"
          @click="setActiveInput(index)"
          :class="{ active: activeInputIndex === index }"
        ></button>
      </div>
      <!-- 入力欄 -->
      <div v-if="activeInputIndex !== -1" class="input-container">
        <input
          v-model="buttons[activeInputIndex].title"
          placeholder="タイトル"
        />
        <input v-model="buttons[activeInputIndex].link_url" placeholder="URL" />
      </div>

      <!-- ボタン詳細設定のポップアップ -->
      <div v-if="showConfigurator" class="popup">
        <!--  @update:coverfileはファイルアップロード時のみ発火 -->
        <ButtonConfigurator
          :cover="buttons[activeDropdown].image_url || null"
          :icon="buttons[activeDropdown].icon_url || null"
          :titlecolor="validateTitleColor(buttons[activeDropdown].title_color)"
          @update:cover="updateCover"
          @update:icon="updateIcon"
          @update:titlecolor="updateTitleColor"
          @close="closeButtonConfigurator"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Button, ButtonType } from '@sharetypes';
import ButtonConfigurator from './ButtonConfigurator.vue';

const props = defineProps({
  isEditing: {
    type: Boolean,
    required: true,
  },
  buttonType: {
    type: String,
    required: false,
  },
  buttons: {
    type: Array as () => Button[],
    required: true,
  },
});

const emit = defineEmits(['update:buttons']);

const activeInputIndex = ref<number>(0);
const activeDropdown = ref<number>(-1); // ドロップダウンの表示状態
const showConfigurator = ref<boolean>(false); // ButtonConfigurator の表示状態

// ボタンタイトルの色
type TitleColor = string; // 型を string に拡張
const validTitleColors: TitleColor[] = ['black', 'white', 'main']; // 有効な値のリスト
const validateTitleColor = (color: string | null): TitleColor => {
  return color && validTitleColors.includes(color) ? color : 'main'; // デフォルト値は 'main'
};

// ドロップダウンの表示・非表示を切り替える
const toggleDropdown = (index: number) => {
  activeDropdown.value = activeDropdown.value === index ? -1 : index;
};
const handleDocumentClick = (event: MouseEvent) => {
  const dropdown = (event.target as HTMLElement).closest('.dropdown');
  const popup = (event.target as HTMLElement).closest('.popup');
  if (!dropdown && !popup) {
    activeDropdown.value = -1;
    showConfigurator.value = false;
  }
};

// 共通処理を抽出
// ※キーをButtonのプロパティに制限<K extends keyof Button>
// ※値の型を自動的に対応するプロパティの型に value: Button[K]
const updateButtonProperty = <K extends keyof Button>(
  key: K,
  value: Button[K]
) => {
  const newButtons = [...props.buttons];
  newButtons[activeDropdown.value][key] = value;
  emit('update:buttons', newButtons);
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
const openButtonConfigurator = (index: number) => {
  activeDropdown.value = index;
  showConfigurator.value = true;
};
// ボタン詳細設定を閉じる
const closeButtonConfigurator = () => {
  showConfigurator.value = false;
};

// トグルボタンをクリックしたときの処理
const setActiveInput = (index: number) => {
  activeInputIndex.value = index;
};

// ボタンクリック（isEditing=true）:詳細設定ドロップダウンを開く
const handleImageClick = (index: number) => {
  if (props.isEditing) {
    toggleDropdown(index);
  } else {
    handleButtonClick(props.buttons[index].link_url);
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

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.button-block {
  margin: 5px auto;
  padding: 4px;
  width: 60%;
}
@media (max-width: 600px) {
  .button-block {
    margin: 5px auto;
    padding: 4px;
    width: 85%;
  }
}

/* ボタン設定 */
.button-row {
  display: flex;
  justify-content: space-around;
  z-index: 9;
}
.button-container {
  flex: 1;
  position: relative;
  margin: 0.1rem;
}
.rounded-button {
  width: 100%;
  padding-top: 100%; /* ボタンを正方形にする */
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent; /* 背景を透明に */
  border: none;
  cursor: pointer;
  position: relative;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  /* シャドウを追加 */
  box-shadow:
    0px 2px 4px var(--shadow),
    0px 1px 3px var(--shadow);
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
.button-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* アスペクト比を維持してトリミング */
}

/* ボタン種類別スタイル */
.small1-button {
  max-width: calc(100% / 4 - 10px);
}
.big3-button {
  max-width: calc(100% / 3 - 10px);
}
.small3-button {
  max-width: calc(100% / 4 - 10px);
}
.small4-button {
  max-width: calc(100% / 4 - 10px);
}
.text-button {
  max-width: calc(100% / 4 - 10px);
}
.textbutton button {
  height: 500px;
}

/* big3-button用タイトルスタイル */
.inbutton-title {
  max-width: 100%;
  top: -2rem;
  margin-bottom: -2rem;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 0;
  white-space: nowrap;
  overflow: hidden;
  font-size: clamp(0.6rem, 2.5vw, 15px);
  color: var(--page-text);
}

@media (max-width: 600px) {
  .inbutton-title {
    top: -1.7rem;
  }
}

/* small-button用タイトルスタイル */
.smallbutton-title {
  display: flex;
  justify-content: center;
  margin-top: 0.2rem;
  font-size: clamp(0.6rem, 2.5vw, 15px);
  white-space: nowrap;
  overflow: hidden;
}

/* 入力 */
.input-container {
  margin-top: 5px;
  font-size: clamp(0.6rem, 2.5vw, 15px);
}
.input-container input {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-size: clamp(0.6rem, 2.5vw, 1rem);
}

/* トグルボタンのスタイル */
.toggle-buttons {
  width: 85%!;
  display: flex;
  gap: 10px;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  justify-content: space-around;
}
.toggle-buttons button {
  color: var(--page-button);
  width: 16px; /* ボタンの幅 */
  height: 16px; /* ボタンの高さ */
  padding: 0; /* パディングをなくす */
  border: 1.5px solid #ccc; /* ボーダーの太さを調整 */
  background-color: #f0f0f0; /* 通常時の背景色 */
  cursor: pointer;
  border-radius: 50%; /* 円形にする */
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  position: relative;
}
.toggle-buttons button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px; /* 内側の円の幅 */
  height: 9px; /* 内側の円の高 */
  background-color: transparent; /* 通常時は透明 */
  border-radius: 50%; /* 円形にする */
  transform: translate(-50%, -50%);
  transition: background-color 0.3s ease;
}
.toggle-buttons button.active {
  border-color: var(--page-button); /* 選択時のボーダー色 */
}
.toggle-buttons button.active::after {
  background-color: var(--page-button); /* 選択時の内側の円の色 */
}
.toggle-buttons button.active {
  border-color: var(--page-button); /* 選択時のボーダー色 */
}
.toggle-buttons button.active::after {
  background-color: var(--page-button); /* 選択時の内側の円の色 */
}

/* ドロップダウン */
.dropdown {
  position: absolute;
  top: -10px;
  right: 0;
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
}

.upload-button {
  display: none;
}
</style>
