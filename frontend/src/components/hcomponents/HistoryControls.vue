<template>
  <div class="history-controls">
    <!-- ソートボックス -->
    <div class="sort-control">
      <label class="sorttitle" for="sort-order">ソート:</label>
      <select id="sort-order" v-model="sortOrder" @change="handleSortChange">
        <option value="date-new">日付順/新⇀旧</option>
        <option value="date-old">日付順/旧⇀新</option>
        <option value="created-new">作成順/新⇀旧</option>
        <option value="created-old">作成順/旧⇀新</option>
      </select>
    </div>

    <!-- レポート表示/非表示トグルボタン -->
    <div class="visibility-control">
      <label class="repotitle">レポート:</label>
      <button
        class="toggle-button"
        :class="{ 'hidden-state': reportVisibility === 'hidden' }"
        @click="toggleVisibility"
      >
        {{ reportVisibility === 'hidden' ? '非表示' : '非表示' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'HistoryControls',
  emits: ['sort-change', 'visibility-change'],
  setup(props, { emit }) {
    // 初期値は「表示」
    const sortOrder = ref('date-new');
    const reportVisibility = ref('repovisible');

    const handleSortChange = () => {
      emit('sort-change', sortOrder.value);
    };

    // 表示/非表示をトグルする関数
    const toggleVisibility = () => {
      reportVisibility.value =
        reportVisibility.value === 'hidden' ? 'repovisible' : 'hidden';
      emit('visibility-change', reportVisibility.value);
    };

    return {
      sortOrder,
      reportVisibility,
      handleSortChange,
      toggleVisibility,
    };
  },
};
</script>

<style scoped>
.history-controls {
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -30px;
  padding: 0.5rem;
  right: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--top-bar-menu-text);
  background-color: var(--top-bar-menu-background-80);
  border-radius: 4px;
  z-index: 100;
}

.sorttitle {
  margin-right: 0.5rem;
}

.repotitle {
  margin-left: 1rem;
}

.visibility-control {
  display: flex;
  align-items: center;
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

/* メディアクエリ: 600px以下の場合 */
@media (max-width: 600px) {
  .history-controls {
    font-size: 0.7rem;
    padding: 0.3rem;
    right: 0.5rem;
  }

  .repotitle {
    margin-left: 0.5rem;
  }

  .toggle-button {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    margin-left: 0.3rem;
  }
}
</style>
