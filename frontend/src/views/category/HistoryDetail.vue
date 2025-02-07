<template>
  <div class="home">
    <TopBar />
    <div class="horizontal-divider"></div>
    <!-- <MenuBar /> -->

    <div class="field">
      <!-- データがない場合 -->
      <div v-if="!history" class="back">↩一覧へ</div>

      <!-- データがある場合 -->
      <div v-if="history" class="main-history">
        <div class="topinfo">
          <div class="back">↩一覧へ</div>
          <!-- システムを表示 -->
          <div class="system">
            <span v-if="history.system">〈</span>
            {{ history.system }}
            <span v-if="history.system">〉</span>
          </div>
        </div>
        <!-- タイトルを表示 -->
        <div class="title">
          <span v-if="history.title" class="titletxt">{{ history.title }}</span>
          <span v-if="!history.title" class="titletxt">New History</span>
        </div>
        <!-- 日付を表示 -->
        <div class="date">
          <span>{{ formatDate(history.date) }}</span>
        </div>
        <!-- 画像を表示 -->
        <div class="image-container" v-if="history.imgURL">
          <img
            :src="history.imgURL"
            alt="History Image"
            v-if="history.imgURL"
            class="history-image"
          />
        </div>
        <!-- レポートを表示 -->
        <div class="report" v-html="formatReport(history.report)"></div>
      </div>
    </div>
    <!-- EditButton コンポーネントに EditNow を渡す -->
    <InfoBlockManager
      :isOwner="isOwner"
      :infoBlocks="childInfoBlock || []"
      @save-page="savehprofile"
      @update-text-block-content="updateTextBlockContent"
      @update-button-block-buttons="updateButtonBlockButtons"
      @update-textbutton-button="updateTextButtonButton"
      @update-info-blocks="updateInfoBlocks"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { useHistoryStore } from '@/stores/historyStore';
// 型定義
import { InfoBlock, Button, HistoryContainer } from '@sharetypes';
// 子コンポーネント
import TopBar from '@/components/standard/topbar.vue';
import InfoBlockManager from '@/components/blockscomponents/InfoBlockManager.vue';

const toast = useToast();
const userStore = useUserStore();
const historyStore = useHistoryStore();
const route = useRoute();
// オーナーフラッグ
const isOwner = userStore.checkOwner(route.params.userNumber);
// ルート
const routeuserNumber = Number(route.params.userNumber); // ルートパラメータから userNumber を取得
const historyId = String(route.params.id); // ルートパラメータから id を取得
// リアクティブ変数
const history = ref<HistoryContainer | null>(null); // 表示する履歴データを格納
const childInfoBlock = ref<InfoBlock[]>([]);

// データを表示用に加工する関数
const formatReport = (report: string | null): string => {
  if (!report) return ''; // reportがnullまたはundefinedの場合、空文字列を返す
  return report.replace(/\n/g, '<br>'); // 改行を<br>に置換
};

// 日付をフォーマットする関数
const formatDate = (dateArray: string[] | null): string => {
  if (!dateArray || dateArray.length === 0) return '';
  if (dateArray.length === 1) return dateArray[0];
  return `${dateArray[0]} ～ ${dateArray[dateArray.length - 1]}`;
};

onMounted(async () => {
  // ストアに値がなければ fetchHistories を呼び出してデータを取得
  if (!historyStore.historiesFetched) {
    await historyStore.fetchHistories(routeuserNumber);
  }

  // histories から id が合致するデータを探す
  const foundHistory = historyStore.getHistories.find(
    (h) => h.id === historyId
  );

  if (foundHistory) {
    history.value = foundHistory; // historyに値を代入
    childInfoBlock.value = foundHistory.childblock; // 合致するデータをセット
  } else {
    console.error('見つかりませんでした');
  }
  // ページのスクロール位置をトップに戻す
  window.scrollTo(0, 0);
});

// 保存
const savehprofile = async () => {
  try {
    await historyStore.savehistProfile(childInfoBlock.value, historyId);
    toast.success('保存されました。');
  } catch (error) {
    toast.error('保存に失敗しました。');
  }
};

// 内容更新
const updateTextBlockContent = (blockId: string, content: string) => {
  const block = childInfoBlock.value.find((b) => b.id === blockId);
  if (block && block.type === 'text') {
    block.content = content;
  }
};
const updateButtonBlockButtons = (blockId: string, buttons: Button[]) => {
  const block = childInfoBlock.value.find((b) => b.id === blockId);
  if (block && block.type === 'button') {
    block.buttons = buttons;
  }
};
const updateTextButtonButton = (blockId: string, button: Button) => {
  const block = childInfoBlock.value.find((b) => b.id === blockId);
  if (block && block.type === 'textbutton') {
    block.button = button;
  }
};

// 全部更新
const updateInfoBlocks = (newBlocks: InfoBlock[]) => {
  childInfoBlock.value = newBlocks;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Oswald|Roboto:400,700');

.home {
  position: relative;
  padding-bottom: 80px;
}
.horizontal-divider {
  margin-top: 32px;
  margin-left: -10%;
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
.field {
  padding-top: 45px;
  width: 60dvw; /* 画面領域 */
  margin: 0 auto;
}
/* モバイル表示 */
@media (max-width: 600px) {
  .field {
    width: 100%;
  }
}
/* 基本情報全体 */
.main-history {
  max-width: 100%; /* コンテンツの最大幅を設定 */
  padding: 10px auto; /* 中央揃え */
}

.topinfo {
  display: flex;
}
/* 一覧へ戻るボタン */
.back {
  font-size: 0.5rem;
  display: flex;
  padding-top: 5px;
}
/* サブタイトル */
.system {
  font-size: 0.8em;
  font-family: 'Oswald', sans-serif;
  margin-left: auto;
}
.title {
  font-family: 'Oswald', sans-serif;
  font-weight: bold;
  font-size: 2em;
  width: 100%;
  word-wrap: break-word; /* 長い単語を折り返す */
  overflow-wrap: break-word; /* 長い単語を折り返す */
  border-top: solid 1px #ccc;
  border-bottom: double 3px var(--page-text);
}
.titletxt {
  margin-left: 1rem;
}
@media (max-width: 600px) {
  .title {
    font-size: 1.5em;
  }
}
/* 日付 */
.date {
  font-size: 0.5em; /* 小さい文字サイズ */
  font-family: 'Oswald', sans-serif;
  display: flex;
}
.date span {
  margin-left: auto;
}

.image-container {
  width: 100%;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.history-image {
  min-width: 30dvw;
  max-width: 85dvw;
  min-height: 30dvw;
  max-height: 80dvw;
  object-fit: contain;
}

/* パソコン表示 */
@media (min-width: 600px) {
  .history-image {
    min-width: 30dvw;
    max-width: 70dvw;
    min-height: 20dvw;
    max-height: 40dvw;
    object-fit: contain;
  }
}

.report {
  font-size: 1em;
  line-height: 1.6; /* 行間を広くする */
  padding-top: 1rem;
  padding-bottom: 1rem; /* 子ブロックとの間隔 */
  border-top: solid 1px var(--page-text);
}

.child-blocks {
  margin-top: 20px;
}

.child-blocks-title {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.child-block {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f9f9f9; /* 子ブロックの背景色 */
  border-radius: 5px; /* 角を丸くする */
}

.no-data {
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-top: 50px;
}
</style>
