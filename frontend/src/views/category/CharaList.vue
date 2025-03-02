<template>

</template>

<script setup lang="ts">

</script>

<style scoped>
/* その他のスタイルは保持 */
.home {
  margin-top: 85px; /* ヘッダーの高さを避けるために調整 */
  position: relative;
  padding-bottom: 100px; /* 下部にマージンを追加 */
}

.character-container-list,
.character-container-panel {
  margin-top: 20px;
}

/* 新規作成ボタンのスタイル */
.add-character {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #c4a623;
  color: white;
  font-size: 30px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 並び替えセレクトボックス */
.sort-container {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  /* 右端に配置 */
}

.sort-select {
  padding: 3px;
  font-size: 13px;
  margin-bottom: -15px;
}

.search-input {
  padding: 8px;
  width: 200px;
}

.display-toggle button {
  margin: 0 10px;
}

.display-toggle button.active {
  font-weight: bold;
}

/* 検索フォーム＋表示切り替えボタン */
.search-and-display-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-and-display-container .search-container {
  margin-bottom: 0;
}

.search-and-display-container .display-toggle {
  margin-bottom: 0;
}

/* タグ検索フォーム */
.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  /* 左端に配置 */
}

/* 表示切替ボタン */
.toggle-button {
  background-color: #c4a623;
  color: #f5f8f7;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.toggle-button:hover {
  background-color: #b1961f;
}

/* キャラクターコンテナ */
.character-container {
  display: flex;
  flex-direction: column;
  margin: 5px;
  border: 1px solid #ccc;
  padding: 10px;
  position: relative;
}

.char-header {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.character-image {
  width: 150px;
  height: 150px;
  margin-right: 10px;
  object-fit: cover;
}

.character-details {
  flex: 1;
}

.character-name {
  font-size: 18px;
  margin: 5px 0;
}

.tags {
  margin-bottom: 10px;
}

.tag {
  background-color: #f1f1f1;
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 5px;
}

/* 最終更新日時 */
.character-container-list .last-updated {
  font-size: 14px;
  color: #888;
  margin-top: 10px;
  align-self: flex-end;
  /* 右下に配置 */
}

.character-container-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* パネル表示の横同士に隙間を追加 */
}

.character-panel-item {
  width: calc(25% - 20px);
  /* 最大4つまでキャラコンテナのアイコン画像を横並びにし、改行するように */
  margin-bottom: 20px;
}

.panel-image {
  width: 100%;
  height: auto;
}

.panel-character-name {
  text-align: center;
  font-size: 10px;
  margin-top: 0px;
}

/* 編集ボタンドロップダウンリスト */
.dropdown-menu {
  position: absolute;
  top: 30px;
  right: 0;
  color: #2e2e2e;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-size: 12px;
  padding: 4px 0;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 5px 10px;
  /* パディングを小さく */
  cursor: pointer;
}

.dropdown-menu li:hover {
  background-color: #f1f1f1;
}
</style>
