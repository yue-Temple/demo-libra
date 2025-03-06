<template>
  <div class="user-config">
    <Topbar />
    <!-- タブ表示 -->
    <Tabs value="0">
      <TabList>
        <Tab value="0">ユーザー設定</Tab>
        <Tab value="1">メニュー設定</Tab>
        <Tab value="2">レイアウト</Tab>
        <Tab value="3">ログ出力</Tab>
      </TabList>
      <TabPanels>
        <!-- ユーザー設定タブ -->
        <TabPanel value="0">
          <UserSection
            v-model:userName="userName"
            :userEmail="userStore.useuserEmail || ''"
            :userGoogle="userStore.useuserGoogle || ''"
            :userIcon="userStore.useuseruserIcon || ''"
            @update:usericon="uploadUserIcon"
          />
        </TabPanel>

        <!-- メニュー設定タブ -->
        <TabPanel value="1">
          <FeaturesSettingsSection
            :featuresFromDB="featuresFromDB"
            @change-menu="handleMenuChange"
          />
        </TabPanel>

        <!-- レイアウト設定タブ -->
        <TabPanel value="2">
          <LayoutSection
            :selectnowlayout="layout"
            @change-layout="handleLayoutChange"
          />
        </TabPanel>

        <!-- ログ出力タブ -->
        <TabPanel value="3">
          <h2>未実装</h2>
          ・ヒストリーデータのExcelデータ出力
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>

  <!-- Save Settings Button -->
  <div class="save-gotomain-button">
    <p v-if="error" class="error">{{ error }}</p>
    <button @click="saveSettings"><i class="pi pi-save">変更を保存</i></button>
    <button @click="handleGoToMainPage">
      <i class="pi pi-home">メインページへ</i>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { Features } from '@sharetypes';

// 子コンポーネント
import Topbar from '@/components/standard/topbar.vue';
import UserSection from '@/components/config/UserSection.vue';
import FeaturesSettingsSection from '@/components/config/FeaturesSettingsSection.vue';
import LayoutSection from '@/components/config/LayoutSection.vue';

// タブコンポーネント
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { goToMainPage } from '@/components/standard/gotomainpage';

const toast = useToast();
// ストアの利用
const userStore = useUserStore();
const layoutStore = useLayoutStore();
const router = useRouter();
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

defineProps<{ userId: string }>(); // userId を受け取る

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
  const tensPlaceValues = featuresFromDB.value.map((feature) =>
    Math.floor((feature.value % 100) / 10)
  ); // 10の位の値を取得
  const onesPlaceValues = featuresFromDB.value.map(
    (feature) => feature.value % 10
  ); // 1の位の値を取得

  // 10の位に1が含まれているかチェック
  const hasMainPage = tensPlaceValues.includes(1);
  if (!hasMainPage) {
    error.value = '1 (メインページ)が設定されていません';
    return;
  }

  // 10の位と1の位の重複チェック
  const hasDuplicatesInTensPlace =
    new Set(tensPlaceValues.filter((value) => value !== 0)).size !==
    tensPlaceValues.filter((value) => value !== 0).length;
  const hasDuplicatesInOnesPlace =
    new Set(onesPlaceValues.filter((value) => value !== 0)).size !==
    onesPlaceValues.filter((value) => value !== 0).length;

  if (hasDuplicatesInTensPlace || hasDuplicatesInOnesPlace) {
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

const handleGoToMainPage = () => {
  goToMainPage(router, null);
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
<style scoped>
h1 {
  margin-top: 45px;
}
.h2 {
  margin-bottom: 0;
}

.user-config {
  max-width: 600px;
  margin: auto;
  margin-top: 60px; /* ヘッダーの高さを避けるために調整 */
  padding: 20px;
  padding-bottom: 200px;
}

/* タブのスタイル */

:deep(.p-tabs p-component) {
  max-width: 100%;
  overflow-x: hidden;
}
:deep(.p-tab:hover) {
  border-color: #000000 !important;
}
:deep(.p-tablist) {
  max-width: 100%;
  overflow-x: hidden;
}
:deep(.p-tablist-tab-list) {
  position: relative;
  background-color: transparent !important;
  color: var(--page-text);
  border-color: var(--page-text);
  max-width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
}
:deep(.p-tablist-tab-list button) {
  border-color: var(--page-text);
  font-size: 0.8rem;
  white-space: normal; /* テキストを折り返す */
  word-wrap: break-word; /* 長い単語も折り返す */
  padding: 10px;
}

:deep(.p-tabpanels) {
  background-color: transparent !important;
  color: var(--page-text);
}
:deep(.p-tab:hover) {
  border-color: var(--page-text) !important;
}

/* アクティブなタブのスタイル */
:deep(.p-tab[aria-selected='true']) {
  background-color: var(--page-button); /* アクティブなタブの背景色 */
  color: var(--page-buttontext); /* アクティブなタブの文字色 */
}

.save-gotomain-button {
  position: fixed;
  right: 8%;
  bottom: 2%;
}
.save-gotomain-button button {
  margin-left: 10px;
  padding: 5px;
  color: var(--page-buttontext);
  background-color: var(--page-button);
}

.error {
  color: red;
  font-size: 0.8rem;
}
</style>
