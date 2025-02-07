<template>
  <div class="home">
    <TopBar />
    <MenuBar />
    <!-- 追加画面 -->
    <Historyaddpopup
      v-if="isPopupVisible"
      :is-visible="isPopupVisible"
      :update-history="updateHistory"
      :container="selectedContainer || undefined"
      :sortOrder="sort"
      @close="closePopup"
      @submit="addHistoryContainer"
      @delete="handleDelete"
    />
    <!-- サムネ画像拡大表示 -->
    <ImagePopup
      :is-visible="isImagePopupVisible"
      :image-src="selectedImageSrc"
      @close="closeImagePopup"
    />
    <!-- ソート機能などコントローラー -->
    <HistoryControls
      @sort-change="handleSortChange"
      @visibility-change="handleVisibilityChange"
    />
    <div class="field">
      <AddConteinerButton
        class="addcontainer"
        @add-container="openPopup"
        v-if="isOwner"
      />
      <div
        v-for="(container, index) in sortedHistories"
        :key="index"
        class="timeline-item"
      >
        <p class="date">
          <span class="date-date">
            {{ formatDateDisplay(container.date) }}
          </span>
          <span class="subtytle">
            {{ formatSystemDisplay(container.system) }}
          </span>
          <span class="lockmark" v-if="isOwner">
            <span v-if="container.private === true">🔒</span>
            <span class="editblock" @click="openEditPopup(container)">
              ✍編集</span
            >
          </span>
        </p>
        <h2>
          <label @click="navigateToDetail(container)" class="title">
            {{ formatTitleDisplay(container.title) }}
          </label>
        </h2>
        <div class="change">
          <div class="imgbox" v-if="container.imgURL">
            <img
              v-if="container.imgURL"
              :src="container.imgURL"
              @click="openImagePopup(container.imgURL)"
            />
          </div>
          <div
            class="text"
            v-if="reportVisibility === 'repovisible' && container.report"
          >
            <p v-html="formatContent4(container.report)"></p>
          </div>
        </div>
      </div>
      <!-- 無限スクロールのローダー -->
      <div ref="loader" v-if="historyStore.hasMore">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useHistoryStore } from '@/stores/historyStore';
import { HistoryContainer } from '@sharetypes';
//コンポーネント
import TopBar from '@/components/standard/topbar.vue';
import MenuBar from '@/components/standard/menubar.vue';
import HistoryControls from '@/components/hcomponents/HistoryControls.vue';
import AddConteinerButton from '@/components/sharecomponents/AddContainerButton.vue';
import Historyaddpopup from '@/components/hcomponents/Historyaddpopup.vue';
import ImagePopup from '@/components/hcomponents/ImagePopup.vue';
import { formatContent4 } from '@/rogics/textformat';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const historyStore = useHistoryStore();
// フラグ
const isPopupVisible = ref(false);
const isImagePopupVisible = ref(false);
const updateHistory = ref(false);
const reportVisibility = ref('repovisible');
// 管理者管理
const routeuserNumber = Number(route.params.userNumber);
const isOwner = userStore.checkOwner(route.params.userNumber);
// 無限スクロール ローダー
const loader = ref<HTMLElement | null>(null);
//
const selectedContainer = ref<HistoryContainer | null>(null);
const selectedImageSrc = ref('');
const sort = ref('date-new');
const sortedHistories = ref<HistoryContainer[]>([]); // 表示用の並び替え結果を保持する

// 初期データ取得
onMounted(async () => {
  await historyStore.fetchHistories(routeuserNumber, 'date', 'DESC'); // 初期表示は日付順（新しい順）
  sortedHistories.value = [...historyStore.getHistories];
});

// ストアの histories が変更されたら sortedHistories を更新
watch(
  () => historyStore.histories,
  (newHistories) => {
    sortedHistories.value = [...newHistories];
  },
  { deep: true }
);

// 無限スクロールのトリガー
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && historyStore.hasMore) {
      historyStore.fetchHistories(routeuserNumber, sort.value);
    }
  });

  if (loader.value) {
    observer.observe(loader.value);
  }
});

// ヒストリーブロック追加
const addHistoryContainer = async (newBlock: HistoryContainer) => {
  try {
    closePopup(); // ポップアップを閉じる
  } catch (error) {
    console.error('追加に失敗しました', error);
  }
};

// ヒストリーブロック削除
const handleDelete = async (historyId: string) => {
  try {
    await historyStore.deleteHistory(historyId); // ストアの histories を更新
    sortedHistories.value = sortedHistories.value.filter(
      (history) => history.id !== historyId
    ); // 表示用のデータも更新
  } catch (error) {
    console.error('削除に失敗しました', error);
  }
};

// 追加更新ポップアップ制御
const openPopup = () => {
  selectedContainer.value = {
    id: '', // 新しいIDは後で生成
    date: [],
    keydate: '',
    title: '',
    system: '',
    report: '',
    imgURL: '',
    private: false,
    childblock: [],
  };
  isPopupVisible.value = true; // ポップアップを開く
  updateHistory.value = false;
};

const closePopup = () => {
  isPopupVisible.value = false;
  updateHistory.value = false;
};

const openEditPopup = (container: HistoryContainer) => {
  const rawContainer = historyStore.getHistories.find(
    (c) => c.id === container.id
  );
  if (rawContainer) {
    selectedContainer.value = rawContainer; // 生データを渡す
    isPopupVisible.value = true; // ポップアップを開く
    updateHistory.value = true; // 編集モードであることを示すフラグ
  } else {
    console.error('該当するコンテナが見つかりませんでした');
    // 必要に応じてエラーハンドリングを行う
  }
};

// HistoryDetailページに遷移
const navigateToDetail = (container: HistoryContainer) => {
  router.push(`/${routeuserNumber}/history/${container.id}`);
};

// 画像拡大表示制御
const openImagePopup = (imageSrc: string) => {
  selectedImageSrc.value = imageSrc;
  isImagePopupVisible.value = true;
};
const closeImagePopup = () => {
  isImagePopupVisible.value = false;
};

// レポート表示/非表示フラグ
const handleVisibilityChange = (newVisibility: string) => {
  reportVisibility.value = newVisibility; // 表示/非表示を更新
};

// 並び替え処理
const handleSortChange = async (sortOrder: string) => {
  historyStore.reset();
  sort.value = sortOrder;
  let sortBy = '';
  let order: 'ASC' | 'DESC' = 'DESC'; // 型を明示的に指定

  switch (sortOrder) {
    case 'date-new':
      sortBy = 'date';
      order = 'DESC';
      break;
    case 'date-old':
      sortBy = 'date';
      order = 'ASC';
      break;
    case 'id-new':
      sortBy = 'id';
      order = 'DESC';
      break;
    case 'id-old':
      sortBy = 'id';
      order = 'ASC';
      break;
  }

  // API呼び出し
  await historyStore.fetchHistories(routeuserNumber, sortBy, order);
  sortedHistories.value = [...historyStore.getHistories];
};

// 表示フォーマット制御群
const formatDateDisplay = (dateArray: string[] | null) => {
  if (!dateArray || dateArray.length === 0) {
    return '';
  }
  const formatSingleDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${year}/${Number(month)}/${Number(day)}`;
  };
  if (dateArray.length === 1) {
    return formatSingleDate(dateArray[0]);
  }
  return `${formatSingleDate(dateArray[0])} ~ ${formatSingleDate(dateArray[dateArray.length - 1])}`;
};

const formatSystemDisplay = (system: string | null) => {
  if (system == '') return null;
  return `〈${system}〉`;
};

const formatTitleDisplay = (title: string | null) => {
  if (title == '') return 'New History';
  return `${title}`;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Oswald|Roboto:400,700');
.home {
  margin-top: 110px; /* ヘッダーの高さを避けるために調整 */
  position: relative;
  padding-bottom: 80px;
}

/* 表示領域 */
.field {
  padding-bottom: 80px;
  width: 60dvw;
  margin: 0 auto;
  margin: auto;
}
/* モバイル表示 */
@media (max-width: 600px) {
  .field {
    width: 90dvw;
  }
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Oswald', sans-serif;
  margin-bottom: 0.2rem;
  margin-left: 0.8rem;
  margin-top: 0rem;
  color: var(--page-text);
}
h1 {
  font-size: 2rem;
  margin-bottom: 0.5em;
}

::v-deep h1,
::v-deep h2,
::v-deep h3,
::v-deep h4,
::v-deep h5,
::v-deep h6 {
  margin-top: 0px;
}

.f1 {
  font-size: 3rem;
}

/* 日付・サブタイトル・編集ボタン・鍵マーク */
.date {
  font-size: 0.8rem;
  margin: 0;
  padding-left: 0.8rem;
  color: var(--page-text);
}
.date-date {
  font-family: 'Oswald', sans-serif;
}
.subtytle {
  font-size: 0.8rem;
  font-weight: bold;
}
.editblock {
  align-items: center;
  font-size: 0.6rem;
  color: #ccc;
  cursor: pointer;
}
.lockmark {
  font-size: 0.6rem;
  align-items: center;
}

/* タイトル */
.title {
  cursor: pointer;
}

/* サムネ画像 */
.imgbox {
  margin-left: 0.8rem;
  padding-top: 0;
  padding-bottom: 0.3rem;
  width: 85dvw;
  max-height: 30dvh;
}
.imgbox img {
  /* .imgbox内のimg要素を対象 */
  border-radius: 8px; /* 角を丸く */
  max-width: 100%; /* 親要素の幅に合わせる */
  max-height: 30dvh; /* 親要素の高さに合わせる */
  object-fit: contain; /* 元画像全体を表示し、アスペクト比を維持 */
  cursor: pointer;
}

.text {
  background-color: var(--page-background-10); /*ずらしたボックスの背景色*/
  margin-left: 1rem;
  max-width: 80dvw;
  padding: 0;
  flex: 1;
}
/*少しずらしたボックス*/
.text {
  background: none; /*元のボックス背景色なし*/
  /* border: 1px solid var(--page-button); 線の太さ・種類・色 */
  position: relative; /*配置（基準）*/
}
.text:after {
  background-color: var(--page-background-10); /*ずらしたボックスの背景色*/
  border: none;
  border-radius: 8px;
  content: '';
  position: absolute; /*配置（ここを動かす）*/
  top: 0px; /*上から7pxずらす*/
  left: 7px; /*左から7pxずらす*/
  width: 100%;
  height: 100%;
  z-index: -1;
}

.text p {
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem;
  margin: 0px;
  margin-left: 0.5rem;
  padding: 1rem;
  color: var(--page-text);
}

/* パソコン表示 */
@media (min-width: 600px) {
  .change {
    display: flex;
    align-items: flex-start;
    width: 60dvw;
  }
  .imgbox {
    margin-left: 0.5rem;
    width: 35dvw;
    max-height: 30dvh;
  }
  .text {
    max-width: 30dvw;
  }
}

.addcontainer {
  margin-left: -3%;
}

/* 時系列の棒 */
.timeline-item {
  position: relative;
  color: rgba(0, 0, 0, 0.7);
  border-left: 2px solid var(--page-text);
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.timeline-item::before {
  content: attr(date-is);
  position: absolute;
  left: 2em;
  top: 1em;
  font-weight: bold;
  display: block;
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 0.785rem;
}
.timeline-item::after {
  width: 10px;
  height: 10px;
  display: block;
  top: 1em;
  position: absolute;
  left: -0.44rem; /* 丸の位置 */
  border-radius: 10px;
  content: '';
  border: 2px solid var(--page-accent);
  background: white;
}
.timeline-item:first-of-type {
  border-image: linear-gradient(to top, var(--page-text) 92%, rgba(0, 0, 0, 0))
    1 100%;
}
.timeline-item:last-child {
  border-image: linear-gradient(
      to bottom,
      var(--page-text) 60%,
      rgba(0, 0, 0, 0)
    )
    1 100%;
}
</style>
