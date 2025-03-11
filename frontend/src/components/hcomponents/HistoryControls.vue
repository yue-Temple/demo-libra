<template>
  <div class="history-controls">
    <div class="search">
      <p>条件検索</p>
      <div class="searchof">
        ▾日付指定<br />
        <input
          type="text"
          placeholder="yyyy-mm-ddを入力"
          maxlength="8"
          inputmode="numeric"
          pattern="\d{1,10}"
          v-model="serchdate"
        />
      </div>
      <div class="searchof">
        ▾タイトル名指定<br />
        <input type="text" placeholder="部分一致検索" v-model="serchtitle" />
      </div>
      <!-- ソートボックス -->
      <div class="searchof" for="sort-order">
        ▾並び順
        <select id="sort-order" v-model="sortOrder">
          <option value="date-new">日付順 / 新⇀旧</option>
          <option value="date-old">日付順 / 旧⇀新</option>
          <option value="id-new">作成順 / 新⇀旧</option>
          <option value="id-old">作成順 / 旧⇀新</option>
        </select>
      </div>
      <div class="reset-serch-button">
        <button class="reset-button" @click="resetSearch">リセット</button>
        <button class="serchbutton" @click="handleSerch">検索</button>
      </div>
    </div>

    <div class="divider" />

    <div class="searchof">
      <!-- レポート表示/非表示トグルボタン -->
      <label class="repotitle">レポート表示：</label>
      <button
        class="toggle-button"
        :class="{ 'hidden-state': reportVisibility === 'hidden' }"
        @click="toggleVisibility"
      >
        {{ reportVisibility === 'hidden' ? '非表示' : '非表示' }}
      </button>
    </div>
  </div>
  <div class="history-controls-sub"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['serch-change', 'visibility-change']);

const sortOrder = ref('date-new');
const reportVisibility = ref('repovisible'); // 初期値は「表示」
const serchdate = ref(null);
const serchtitle = ref(null);

// 条件検索関数
const handleSerch = () => {
  emit('serch-change', {
    date: serchdate.value,
    title: serchtitle.value,
    sortOrder: sortOrder.value,
  });
};

// 入力リセット処理
const resetSearch = () => {
  serchdate.value = null; // 日付指定をリセット
  serchtitle.value = null; // タイトル名指定をリセット
};

// 表示/非表示をトグルする関数
const toggleVisibility = () => {
  reportVisibility.value =
    reportVisibility.value === 'hidden' ? 'repovisible' : 'hidden';
  emit('visibility-change', reportVisibility.value);
};
</script>

<style scoped>
/* 区切り線 */
.divider {
  width: 100%;
  border-top: #ccc solid 1px;
  color: transparent;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
/* 空間確保用 */
.history-controls-sub {
  position: relative;
  display: flex;
  width: 25dvw;
  max-width: 230px;
  height: 290px;
  padding: 1rem;
  margin: 1rem;
  margin-right: 2rem;
  margin-left: 1rem;
}
.history-controls {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  width: 25dvw;
  max-width: 230px;
  padding: 1rem;
  margin: 1rem;
  margin-right: 2rem;
  margin-left: 1rem;
  font-size: 1rem;
  font-weight: bold;
  background-color: var(--top-bar-menu-background-10);
  border: 4px double #ccc;
  border-radius: 4px;
  z-index: 10;
}

.history-controls select {
  width: 100%;
}

.toggle-button {
  display: inline-block; /* サイズを意識するために block/inline-block を使用 */
  width: 3.5rem; /* 固定幅を設定 */
  height: 1.5rem;
  padding: calc(0.25rem - 1px) calc(0.5rem - 1px); /* ボーダー分を引く */
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  color: black;
  cursor: pointer;
  font-size: 0.8rem;
  margin-bottom: 10px;
  margin-left: 0.5rem;
  box-sizing: border-box; /* ボーダーを幅に含める */
}
.toggle-button.hidden-state {
  border: 2px solid #ccc; /* ボーダーのサイズ変更 */
  padding: calc(0.25rem - 2px) calc(0.5rem - 2px); /* ボーダー分を引く */
  width: 3.5rem; /* 固定幅を設定 */
  height: 1.5rem;
  background-color: var(--page-accent);
  color: var(--page-buttontext);
  font-weight: bold;
  box-sizing: border-box; /* 同じく適用 */
}

.search {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
}
.search input,
.search select {
  margin-bottom: 0.5rem;
  padding: 1px;
  width: 100%;
}
.search button {
  width: 70px;
  margin-left: auto;
  margin-top: 1rem;
  padding: 5px;
}
.searchof {
  font-size: 0.9rem !important;
}
.search p {
  font-size: 1.2rem !important;
  margin-top: 0.5rem;
}

.reset-serch-button {
  display: flex;
}
.reset-serch-button .serchbutton {
  margin-left: 0.5rem;
}

/* メディアクエリ: 600px以下の場合 */
@media (max-width: 600px) {
  .search input,
  .search select {
    padding: 5px;
  }
  .history-controls-sub {
    height: 0;
    width: 0;
    padding: 0;
    margin: 0;
  }
  .history-controls {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    width: 95dvw;
    max-width: 100%;
    padding: 1rem;
    margin: 0;
    margin-right: 0rem;
    margin-left: 0rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: var(--top-bar-menu-background-10);
    border: 4px double #ccc;
    border-radius: 4px;
    z-index: 10;
  }
}
</style>
