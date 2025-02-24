<template>
  <div class="user-config">
    <Topbar />
    <div class="horizontal-divider"></div>
    <h1>設定画面</h1>

    <!-- UserSection コンポーネント -->
    <UserSection
      v-model:userName="userName"
      :userEmail="userStore.useuserEmail || ''"
      :userGoogle="userStore.useuserGoogle || ''"
      :userIcon="userStore.useuseruserIcon || ''"
      @update:usericon="uploadUserIcon"
    />

    <!-- Features Settings Section -->
    <FeaturesSettingsSection
      :featuresFromDB="featuresFromDB"
      :error="error"
      @change-menu="handleMenuChange"
    />

    <!-- Layout LayoutSection Section -->
    <LayoutSection
      :selectnowlayout="layout"
      @change-layout="handleLayoutChange"
    />

    <!-- Save Settings Button -->
    <button @click="saveSettings">設定を保存</button>

    <!-- Main Page Button -->
    <MainPageButton />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { Features } from '@sharetypes';

// 子コンポーネント
import Topbar from '@/components/standard/topbar.vue';
import UserSection from '@/components/config/UserSection.vue';
import FeaturesSettingsSection from '@/components/config/FeaturesSettingsSection.vue';
import LayoutSection from '@/components/config/LayoutSection.vue';
import MainPageButton from '@/components/config/MainPageButton.vue';

const toast = useToast();
// ストアの利用
const userStore = useUserStore();
const layoutStore = useLayoutStore();
const useuserNumber = Number(userStore.useuserNumber);

// 描写データ
const userName = ref(userStore.useuserName);
const userIcon = ref(userStore.useuseruserIcon);
const featuresFromDB = ref<Features[]>([...userStore.features]);
const layout = ref(layoutStore.currentLayout);
const isEditing = ref(true);
const error = ref('');
const uploadfile = ref<File | null>(null);

// 変更前の値を保持
const oldName = ref(userStore.useuserName);
const oldIcon = ref(userStore.useuseruserIcon);
const oldFeatures = ref<Features[]>();
const oldLayout = ref(layoutStore.currentLayout);

onMounted(async () => {
  // メニューデータ取得
  if (useuserNumber) {
    await userStore.fetchFeatures(useuserNumber);
    // ストアの値が更新されたら、初期値を再設定
    featuresFromDB.value = [...userStore.features];
    oldFeatures.value = JSON.parse(JSON.stringify(userStore.features)); // (ディープコピー)
  }
});

// アイコンアップロードをリッスン
const uploadUserIcon = (file: File) => {
  uploadfile.value = file;
  userIcon.value = URL.createObjectURL(file); // アイコンを一時的に表示
};

// メニュー情報変更をリッスン
const handleMenuChange = (newfeatures: Features[]) => {
  featuresFromDB.value = newfeatures;
};

// レイアウト変更をリッスン
const handleLayoutChange = (newLayout: string) => {
  layout.value = newLayout;
  layoutStore.setLayout(newLayout);
};

// 変更があるかどうかをチェック
const hasChanges = () => {
  const isFeaturesChanged =
    JSON.stringify(featuresFromDB.value) !== JSON.stringify(oldFeatures.value);
  const isLayoutChanged = layout.value !== oldLayout.value;
  const isUserNameChanged = userName.value !== oldName.value;
  const isUserIconChanged = userIcon.value !== oldIcon.value;

  return {
    isFeaturesChanged,
    isLayoutChanged,
    isUserNameChanged,
    isUserIconChanged,
    hasAnyChanges:
      isFeaturesChanged ||
      isLayoutChanged ||
      isUserNameChanged ||
      isUserIconChanged,
  };
};

const saveSettings = async () => {
  // 変更状態を取得
  const {
    isFeaturesChanged,
    isLayoutChanged,
    isUserNameChanged,
    isUserIconChanged,
    hasAnyChanges,
  } = hasChanges();

  // 変更がない場合は保存処理をスキップ
  if (!hasAnyChanges) {
    toast.success('保存しました');
    console.log('変更がないため、保存をスキップします');
    return;
  }

  // メニュー設定のバリデーション
  const mainPageCount = featuresFromDB.value.filter(
    (feature) => feature.value === 1
  ).length;
  const hasNoMainPage = mainPageCount === 0;

  // 番号の重複がある場合
  const hasDuplicates =
    new Set(
      featuresFromDB.value.filter((f) => f.value !== 0).map((f) => f.value)
    ).size !== featuresFromDB.value.filter((f) => f.value !== 0).length;

  if (hasNoMainPage) {
    error.value = ' 1 (メインページ)が設定されていません';
    return;
  }
  if (hasDuplicates) {
    error.value = '番号の重複は避けてください';
    return;
  }

  error.value = '';

  try {
    // ユーザーデータに変更がある場合のみ保存
    if (isUserNameChanged || isUserIconChanged) {
      await userStore.saveUserData(
        userStore.useuserId,
        userName.value,
        userIcon.value,
        uploadfile.value
      );
      // 変更前の値を更新
      oldName.value = userName.value;
      oldIcon.value = userIcon.value;
    }

    // メニューまたはレイアウトに変更がある場合のみ保存
    if (isFeaturesChanged || isLayoutChanged) {
      await userStore.saveMenuAndLayout(featuresFromDB.value, layout.value);
      // 変更前の値を更新
      oldFeatures.value = JSON.parse(JSON.stringify(featuresFromDB.value));
      userStore.features = JSON.parse(JSON.stringify(featuresFromDB.value));
      oldLayout.value = layout.value;
    }

    toast.success('設定を保存しました');
    isEditing.value = false;
  } catch (error) {
    console.error('設定の保存に失敗しました', error);
    toast.error('設定の保存に失敗しました');
  }
};

// 変更前に戻す処理
const resetSettings = () => {
  featuresFromDB.value = JSON.parse(JSON.stringify(oldFeatures.value)); // （新しい配列を作成）
  userStore.features = [...featuresFromDB.value];

  layoutStore.setLayout(oldLayout.value);
};

// ページ遷移警告
onBeforeRouteLeave((to, from, next) => {
  const { hasAnyChanges } = hasChanges();
  if (hasAnyChanges) {
    const confirmLeave = window.confirm(
      '変更が保存されていません。ページを離れますか？'
    );
    if (confirmLeave) {
      resetSettings();
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});
</script>

<style>
/* ページ全体の背景色 */
body {
  color: var(--page-text);
  background-color: var(--page-background);
}
</style>

<style scoped>
h1 {
  margin-top: 45px;
}
.h2 {
  margin-bottom: 0;
}
.horizontal-divider {
  margin-top: 12px;
  margin-left: -100%;
  width: 250%;
  position: fixed;
  height: 10px; /* 線の太さ */
  background-color: var(--page-accent); /* 線の色 */
}

.horizontal-divider::before {
  content: ''; /* 必須: 疑似要素を表示 */
  position: absolute; /* 親要素内に固定配置 */
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../src/assets/texture.jpg'); /* テクスチャ画像 */
  background-size: cover; /* 画像を全体にフィット */
  background-position: center; /* 中央揃え */
  opacity: 0.1; /* テクスチャの透明度20% */
  z-index: -1;
}

.user-config {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
