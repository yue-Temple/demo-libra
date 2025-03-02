<template>
  <!-- <MenuBar /> -->
  <TopBar />
  <div class="home">
    <div class="field">
      <!-- データがない場合 -->
      <div v-if="!history" class="back">存在しないページです。</div>

      <!-- データがある場合 -->
      <div v-if="history" class="main-history">
        <div class="topinfo">
          <div class="back">✍基本情報の編集 / 記録の共有</div>
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
            :src="getImageSrc(history.imgURL)"
            alt="History Image"
            v-if="history.imgURL"
            class="history-image"
          />
        </div>
        <!-- レポートを表示 -->
        <div class="report" v-html="formatReport(history.report)"></div>
      </div>
    </div>
    <div class="prof-field">
      <InfoBlockManager
        :infoBlocks="childInfoBlock"
        @save-page="savehprofile"
        @update-info-blocks="updateInfoBlocks"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { useHistoryStore } from '@/stores/historyStore';
// 型定義
import { InfoBlock, HistoryContainer } from '@sharetypes';
// 子コンポーネント
import TopBar from '@/components/standard/topbar.vue';
import InfoBlockManager from '@/components/blockscomponents/InfoBlockManager.vue';
import { getOldObjectKeys } from '@/rogics/getOldObjectKey';

// 遷移URLパラメーター
defineProps({
  userNumber: String,
  id: String,
});

const toast = useToast();
const userStore = useUserStore();
const historyStore = useHistoryStore();
const route = useRoute();
// ルート
const routeuserNumber = Number(route.params.userNumber); // ルートパラメータから userNumber を取得
const historyId = String(route.params.id); // ルートパラメータから id を取得
// リアクティブ変数
const history = ref<HistoryContainer | null>(null); // 表示する履歴データを格納
const childInfoBlock = ref<InfoBlock[]>([]);
const oldchildInfoBlock = ref<InfoBlock[]>([]);
const addBlocks = ref<InfoBlock[]>([]);
const deleteBlocks = ref<InfoBlock[]>([]);

onMounted(async () => {
  // 既にデータ取得済みの場合
  if (historyStore.histories.length > 0) {
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
  } else {
    console.log('リロード/リダイレクト');
    // 再読みでレイアウト情報が無い時、メニュー情報とヒストリ詳細データを取得しに行く
    userStore.fetchFeatures(Number(route.params.userNumber));
    const response = await historyStore.fetchHistoriesdetail(
      routeuserNumber,
      historyId
    );
    if (response) {
      history.value = response;
      childInfoBlock.value = response.childblock;
    }
  }
  // ページのスクロール位置をトップに戻す
  window.scrollTo(0, 0);
});

// 保存
const savehprofile = async () => {
  try {
    // 変更がない場合の判定（深い比較）
    if (
      JSON.stringify(oldchildInfoBlock.value) ===
      JSON.stringify(childInfoBlock.value)
    ) {
      console.log('変更がないため、保存をスキップします。');
      toast.success('保存しました');
      return;
    }

    // old_object_key 配列を作成
    const old_object_keys = getOldObjectKeys(
      childInfoBlock.value,
      oldchildInfoBlock.value
    );

    // 変更がある場合、保存処理を実行
    await historyStore.savehistProfile(
      historyId,
      childInfoBlock.value,
      deleteBlocks.value,
      old_object_keys
    );
    toast.success('保存しました');
    // 保存後にoldInfoBlockを更新
    oldchildInfoBlock.value = JSON.parse(JSON.stringify(childInfoBlock.value));
    // フラグ配列を初期化
    addBlocks.value = [];
    deleteBlocks.value = [];
  } catch (error) {
    toast.error('保存に失敗しました');
    // フラグ配列を初期化
    addBlocks.value = [];
    deleteBlocks.value = [];
  }
};

// 全部更新メソッド
const updateInfoBlocks = (
  newBlocks: InfoBlock[],
  addblock: InfoBlock,
  deleteblock: InfoBlock
) => {
  // 1. 新しいブロックリストをセット
  childInfoBlock.value = newBlocks;

  // 2. 追加されたブロックを addBlocks に追加
  if (addblock) {
    addBlocks.value.push(addblock);
  }

  // 3. 削除されたブロックを deleteBlocks に追加
  if (deleteblock) {
    // addBlocks 配列に deleteblock と同じブロックがあるかどうかを確認
    const index = addBlocks.value.findIndex(
      (block) => block.id === deleteblock.id
    );

    if (index !== -1) {
      addBlocks.value.splice(index, 1); // addBlocks 配列に同じブロックがある場合、そのブロックを削除
    } else {
      deleteBlocks.value.push(deleteblock); // addBlocks 配列に同じブロックがない場合、deleteBlocks 配列に追加
    }
  }
};

// 起こりえないが、history.imgURLのFile可能性を消すための処理
const getImageSrc = (imageUrl: string | File): string => {
  if (typeof imageUrl === 'string') {
    return imageUrl;
  } else if (imageUrl instanceof File) {
    return URL.createObjectURL(imageUrl); // File型の場合はBlob URLを生成
  }
  return '';
};

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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Oswald|Roboto:400,700');

.home {
  margin-top: 30px;
  position: relative;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 子要素を水平方向の中央に */
  justify-content: center; /* 子要素を垂直方向の中央に */
}

.field {
  display: flex;
  flex-direction: column; /* 縦並び */
  align-items: center; /* 水平方向の中央揃え */
  padding-top: 45px;
  width: 100%;
  padding: 0 auto; /*左右中央揃え*/
}
/* 基本情報全体 */
.main-history {
  width: 100%;
  max-width: 700px; /* コンテンツの最大幅を設定 */
  padding: 10px;
}
.prof-field {
  padding-top: 45px;
  width: 100%;
  padding: 0 auto;
}
/* モバイル表示 */
@media (max-width: 600px) {
  .field {
    width: 97dvw;
  }
}

.topinfo {
  display: flex;
}
/* 一覧へ戻るボタン */
.back {
  font-size: 0.6rem;
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
  margin-right: 0.5rem;
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
  max-width: 95dvw;
  min-height: 30dvw;
  max-height: 60dvw;
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
  padding-left: 1rem;
  padding-right: 1rem;
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

.prof-field {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
