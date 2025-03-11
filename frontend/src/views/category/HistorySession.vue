<template>
  <div class="home">
    <TopBar />
    <MenuBar />
    <!-- 追加画面 -->
    <Historyaddpopup
      v-if="isEditPopupVisible"
      :is-visible="isEditPopupVisible"
      :update-history="updateHistory"
      :container="selectedContainer || undefined"
      :sortOrder="sort || 'date-new'"
      @close="closePopup"
      @delete="handleDelete"
    />
    <!-- サムネ画像拡大表示 -->
    <ImagePopup
      :is-visible="isImagePopupVisible"
      :image-src="selectedImageSrc"
      @close="closeImagePopup"
    />
    <div class="allcontent">
      <!-- コントローラー -->
      <div class="mobile-only" v-if="!isMobile">
        <HistoryControls
          @serch-change="handleSerchChange"
          @visibility-change="handleVisibilityChange"
        />
      </div>

      <div class="field">
        <!-- コントローラー（モバイル） -->
        <div class="mobile-only" v-if="isMobile">
          <HistoryControls
            @serch-change="handleSerchChange"
            @visibility-change="handleVisibilityChange"
          />
        </div>
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
          <div v-if="container.private === false || isOwner">
            <span class="timeline-itemcercle"></span>
            <div class="date">
              <span class="date-date">
                {{ formatDateDisplay(container.date) }}
              </span>
              <!-- サブタイトル -->
              <span class="subtytle" v-if="container.system">
                {{ formatSystemDisplay(container.system) }}
              </span>
            </div>

            <label @click="navigateToDetail(container)" class="title">
              {{ formatTitleDisplay(container.title) }}
            </label>
            <!-- 非公開マーク -->
            <span class="lockmark" v-if="isOwner && container.private === true">
              <i class="pi pi-lock" style="font-size: 0.8rem"></i>
            </span>

            <div class="change">
              <div class="imgbox" v-if="container.imgURL">
                <img
                  v-if="container.imgURL"
                  :src="getImageSrc(container.imgURL)"
                  @click="openImagePopup(getImageSrc(container.imgURL))"
                />
              </div>

              <div class="text-edit">
                <div
                  class="text"
                  v-if="reportVisibility === 'repovisible' && container.report"
                >
                  <p v-html="formatContent4(container.report)"></p>
                </div>
              </div>
            </div>
            <!-- オーナー用 -->
            <div
              class="forowner"
              v-if="isOwner && reportVisibility === 'repovisible'"
            >
              <div class="editblock" @click="openEditPopup(container)">
                <i class="pi pi-pen-to-square" style="font-size: 0.8rem"
                  >編集</i
                >
              </div>
              <div class="editblock2" @click="opensharePopup(container)">
                <i class="pi pi-share-alt" style="font-size: 0.8rem">共有</i>
              </div>
            </div>
          </div>
        </div>
        <!-- 無限スクロールのローダー -->
        <div ref="loader" v-if="historyStore.hasMore">Loading...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useHistoryStore } from '@/stores/historyStore';
import { HistoryContainer } from '@sharetypes';
//コンポーネント
import TopBar from '@/components/standard/topbar.vue';
import MenuBar from '@/components/standard/menubar.vue';
import HistoryControls from '@/components/hcomponents/HistoryControls.vue';
import AddConteinerButton from '@/components/hcomponents/AddContainerButton.vue';
import Historyaddpopup from '@/components/hcomponents/Historyaddpopup.vue';
import ImagePopup from '@/components/sharecomponents/ImagePopup.vue';
import { formatContent4 } from '@/rogics/textformat';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const historyStore = useHistoryStore();
// フラグ
const isEditPopupVisible = ref(false);
const isImagePopupVisible = ref(false);
const updateHistory = ref(false);
const reportVisibility = ref('repovisible');
const isMobile = ref(false);
// 管理者管理
const routeuserNumber = Number(route.params.userNumber);
const isOwner = userStore.checkOwner(route.params.userNumber);
// 無限スクロール ローダー
const loader = ref<HTMLElement | null>(null);
//
const selectedContainer = ref<HistoryContainer | null>(null);
const selectedImageSrc = ref('');
const sortedHistories = ref<HistoryContainer[]>([]); // 表示用の並び替え結果を保持する
//検索条件
const sort = ref(); //id or date
const sortBy = ref(); // 'ASC' | 'DESC'
const serchdate = ref<string | null>(null);
const serchtitle = ref<string | null>(null);

onMounted(async () => {
  // メニュー取得確認
  await userStore.fetchFeatures(Number(route.params.userNumber));

  // 非公開ページ検証
  if (
    userStore.features[1].value.toString().startsWith('9') &&
    userStore.useuserNumber != route.params.userNumber
  ) {
    router.push({
      path: '/not-found',
      query: { message: '非公開のページです。' },
    });
  } else {
    // 初期データ取得
    sortedHistories.value = [...historyStore.getHistories];
  }

  // 無限スクロールのトリガー
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && historyStore.hasMore) {
      historyStore.fetchHistories(
        routeuserNumber,
        sort.value,
        sortBy.value,
        serchdate.value,
        serchtitle.value
      );
    }
  });

  if (loader.value) {
    observer.observe(loader.value);
  }

  // コンポーネントがマウントされたときにスクロール位置を復元
  restoreScrollPosition();
  // スクロールイベントのリスナーを追加
  window.addEventListener('scroll', saveScrollPosition);
  // モバイル判定
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile); // リサイズ時の監視
});

// ストアの histories が変更されたら sortedHistories を更新
watch(
  () => historyStore.histories,
  (newHistories) => {
    sortedHistories.value = [...newHistories];
  },
  { deep: true }
);

// コンポーネントがアンマウントされる前にスクロールイベントのリスナーを削除
onUnmounted(() => {
  window.removeEventListener('scroll', saveScrollPosition);
  window.removeEventListener('resize', checkIfMobile);
});

// モバイル判定用の関数
const checkIfMobile = () => {
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  isMobile.value = mediaQuery.matches;
};

// スクロール位置を保存する関数
const saveScrollPosition = () => {
  historyStore.saveScrollPosition(window.scrollY);
};

// スクロール位置を復元する関数
const restoreScrollPosition = () => {
  nextTick(() => {
    const savedPosition = historyStore.getScrollPosition();
    window.scrollTo(0, savedPosition);
  });
};

// ページ遷移前にスクロール位置を保存
router.beforeEach((to, from, next) => {
  if (from.name === 'Home') {
    // Home ページからの遷移の場合のみ保存
    saveScrollPosition();
  }
  next();
});

// ヒストリーブロック削除
const handleDelete = async (historyId: string, imageURL: string) => {
  try {
    await historyStore.deleteHistory(historyId, imageURL); // ストアの histories を更新
    sortedHistories.value = sortedHistories.value.filter(
      (history) => history.id !== historyId
    ); // 表示用のデータも更新
  } catch (error) {
    console.error('削除に失敗しました', error);
  }
};

// 追加モードポップアップ
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
  isEditPopupVisible.value = true; // ポップアップを開く
  updateHistory.value = false;
};
// 編集モードポップアップ
const openEditPopup = (container: HistoryContainer) => {
  const rawContainer = historyStore.getHistories.find(
    (c) => c.id === container.id
  );
  if (rawContainer) {
    selectedContainer.value = rawContainer; // 生データを渡す
    isEditPopupVisible.value = true; // ポップアップを開く
    updateHistory.value = true; // 編集モードであることを示すフラグ
  } else {
    console.error('該当するコンテナが見つかりませんでした');
    // 必要に応じてエラーハンドリングを行う
  }
};
// シェアポップアップ
const opensharePopup = (container: HistoryContainer) => {
  const rawContainer = historyStore.getHistories.find(
    (c) => c.id === container.id
  );
  alert('まだ実装してないよ');
  if (rawContainer) {
    selectedContainer.value = rawContainer; // 生データを渡す
    // ポップアップを開くフラグ
  } else {
    console.error('該当するコンテナが見つかりませんでした');
    // 必要に応じてエラーハンドリングを行う
  }
};
// ポップアップを閉じる
const closePopup = () => {
  isEditPopupVisible.value = false;
  updateHistory.value = false;
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

// 並び替え検索処理
const handleSerchChange = async (searchData: {
  date: string;
  title: string;
  sortOrder: string;
}) => {
  const { date, title, sortOrder } = searchData; // オブジェクトを分割代入
  historyStore.reset();
  serchdate.value = date;
  serchtitle.value = title;

  switch (sortOrder) {
    case 'date-new':
      sort.value = 'date';
      sortBy.value = 'DESC';
      break;
    case 'date-old':
      sort.value = 'date';
      sortBy.value = 'ASC';
      break;
    case 'id-new':
      sort.value = 'id';
      sortBy.value = 'DESC';
      break;
    case 'id-old':
      sort.value = 'id';
      sortBy.value = 'ASC';
      break;
  }

  // API再呼び出し
  await historyStore.fetchHistories(
    routeuserNumber,
    sort.value,
    sortBy.value,
    serchdate.value,
    serchtitle.value
  );
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

// 起こりえないが、container.imgURLのFile可能性を消すための処理
const getImageSrc = (imageUrl: string | File): string => {
  if (typeof imageUrl === 'string') {
    return imageUrl;
  } else if (imageUrl instanceof File) {
    return URL.createObjectURL(imageUrl); // File型の場合はBlob URLを生成
  }
  return '';
};

// ポップアップの表示状態を監視して、bodyのスクロールを制御
watch(
  () => isEditPopupVisible.value,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'; // スクロールを無効にする
    } else {
      document.body.style.overflow = ''; // スクロールを有効にする
    }
  }
);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Oswald|Roboto:400,700');
.home {
  margin-top: 110px; /* ヘッダーの高さを避けるために調整 */
  position: relative;
  padding-bottom: 80px;
}
.allcontent {
  display: flex;
  justify-content: center; /* 横方向の中央揃え */
  margin: auto;
}
/* 表示領域 */
.field {
  padding-bottom: 80px;
  width: 60dvw;
  margin: 0;
  margin-right: 20px;
}
/* モバイル表示 */
@media (max-width: 600px) {
  .field {
    width: 90dvw;
    margin-left: 1rem;
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

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6) {
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
  display: flex;
}
.date-date {
  font-family: 'Oswald', sans-serif;
}
.subtytle {
  font-size: 0.8rem;
  font-weight: bold;
  margin: 0;
  padding-top: 2px;
  padding-left: 0.2rem;
  color: var(--page-text);
}

.lockmark {
  font-size: 0.6rem;
  align-items: center;
  color: var(--page-text);
}

/* タイトル */
.title {
  cursor: pointer;
  font-weight: bold;
  font-family: 'Oswald', sans-serif;
  font-size: 1.6rem;
  margin-bottom: 0.2rem;
  margin-left: 0.8rem;
  margin-top: 0rem;
  color: var(--page-text);
}

/* サムネ画像 */
.imgbox {
  margin-left: 0.8rem;
  padding-top: 0;
  padding-bottom: 0.3rem;
  width: 90%;
  max-height: 30%;
}
.imgbox img {
  /* .imgbox内のimg要素を対象 */
  border-radius: 8px; /* 角を丸く */
  max-width: 100%; /* 親要素の幅に合わせる */
  max-height: 30%; /* 親要素の高さに合わせる */
  object-fit: contain; /* 元画像全体を表示し、アスペクト比を維持 */
  cursor: pointer;
}

.text {
  margin-left: 1rem;
  max-width: 80dvw;
  flex: 1;
  border-left: 10px solid var(--page-button);
  position: relative; /*配置（基準）*/
}
.text:after {
  background-color: var(--page-background-10); /*ずらしたボックスの背景色*/
  border: none;
  content: '';
  position: absolute; /*配置（ここを動かす）*/
  top: 0px; /*上から7pxずらす*/
  left: 0px; /*左から7pxずらす*/
  width: 100%;
  height: 100%;
  z-index: -1;
}
.text p {
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem;
  margin: 0px;
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
    max-width: 500px;
  }
  .text {
    max-width: 350px;
  }
  .text-edit {
    width: 60dvw;
    max-width: 350px;
  }
}

/* オーナー用 */
.forowner {
  display: flex;
  justify-content: space-around;
  margin: 2px;
  margin-left: 1rem;
  width: 130px;
  border: var(--page-button) solid 1px;
  color: var(--page-buttontext);
}
.editblock,
.editblock2 {
  width: 65px;
  display: flex;
  justify-content: center;
  padding: 5px;
  padding-bottom: 6px;
  background-color: var(--page-button);
  cursor: pointer;
}
.editblock2 {
  border-left: var(--page-buttontext) solid 1px;
}
.editblock:hover,
.editblock2:hover {
  background-color: var(--page-button-sub);
}

:deep(.pi.pi-share-alt)::before,
:deep(.pi.pi-pen-to-square)::before {
  font-size: 12px !important;
  margin-right: 4px;
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
.timeline-itemcercle {
  width: 12px;
  height: 12px;
  display: block;
  top: 1.2em;
  position: absolute;
  left: -0.44rem; /* 丸の位置 */
  border-radius: 10px;
  content: '';
  border: 2px solid var(--page-text);
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
