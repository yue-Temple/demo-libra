<template>
  <div class="home">
    <TopBar />
    <MenuBar />

    <!-- 新規作成ボタン（ページの所有者のみ表示） -->
    <button v-if="isOwner" class="add-character" @click="addCharacter">
      ＋
    </button>

    <div>
      <!-- タグ検索ボックスと表示切替ボタン -->
      <div class="search-and-display-container">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="タグで検索"
            class="search-input"
          />
        </div>
        <div class="display-toggle">
          <button @click="toggleDisplayMode" class="toggle-button">
            表示切替
          </button>
        </div>
      </div>

      <!-- 並び替えセレクトボックス -->
      <div class="sort-container">
        <label for="sort-select" class="sort-label"></label>
        <select v-model="sortOrder" id="sort-select" class="sort-select">
          <option value="asc">更新日-昇順</option>
          <option value="desc">更新日-降順</option>
        </select>
      </div>

      <!-- キャラコンテナ：リスト表示 -->
      <div v-if="displayMode === 'list'" class="character-container-list">
        <div
          v-for="(character, index) in filteredCharacters"
          :key="index"
          class="character-container"
        >
          <div class="char-header">
            <img
              :src="character.icon"
              alt="キャラアイコン"
              class="character-image"
            />
            <div class="character-details">
              <div class="tags">
                <span v-for="(tag, i) in character.tags" :key="i" class="tag">{{
                  tag
                }}</span>
              </div>
              <div class="character-name">
                <a
                  @click="goToDetails(character.id)"
                  :title="character.name"
                  href="javascript:void(0)"
                  class="character-name-link"
                >
                  {{ character.name }}
                </a>
              </div>
            </div>
            <!-- 編集ボタン（右上）（ページの所有者のみ表示） -->
            <div
              v-if="character.ownerId === userId"
              class="edit-button"
              @click="CharaThreeMenu(index)"
            >
              ︙
            </div>
            <!-- ドロップダウンリスト -->
            <div v-if="dropdownIndex === index" class="dropdown-menu">
              <ul>
                <li @click="goToDetails(character.id)">編集</li>
                <li @click="addElement(character.id)">要素の追加</li>
                <li @click="removeElement(character.id)">要素の削除</li>
                <li @click="deleteCharacter(character.id)">削除</li>
              </ul>
            </div>
          </div>
          <div class="last-updated">
            {{ formatDate(character.lastUpdated) }}
          </div>
        </div>
      </div>

      <!-- キャラコンテナ：パネル表示 -->
      <div v-if="displayMode === 'panel'" class="character-container-panel">
        <div
          v-for="(character, index) in filteredCharacters"
          :key="index"
          class="character-panel-item"
        >
          <img :src="character.icon" alt="キャラアイコン" class="panel-image" />
          <div class="panel-character-name">{{ character.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
// import { useRouter, useRoute } from 'vue-router';
// import { jwtDecode } from 'jwt-decode';
// import TopBar from '@/components/standard/topbar.vue';
// import MenuBar from '@/components/standard/menubar.vue';

// //型明記

// interface Character {
//   id: number;
//   ownerId: string | null;
//   name: string;
//   icon: string;
//   tags: string[];
//   lastUpdated: string;
// }

// interface JwtPayload {
//   user_id: string;
//   email: string;
//   user_number: number;
// }

// export default defineComponent({
//   components: {
//     TopBar,
//     MenuBar,
//   },
//   setup() {
//     const router = useRouter(); //ルーターインスタンスを取得するための関数
//     const route = useRoute(); //現在のルート情報を取得するための関数
    

//     // 現在のページを判定する関数
//     const isCurrentPage = (featureName: string): boolean => {
//       return route.path.includes(featureName);
//     };

//     // トークンからユーザーナンバーとIDを取得
//     const token = localStorage.getItem('token');
//     const userNumber = ref<string>(
//       token ? String((jwtDecode(token) as JwtPayload).user_number) : ''
//     );
//     const userId = ref<string | null>(
//       token ? (jwtDecode(token) as JwtPayload).user_id : null
//     );

//     // 固定メニュー
//     const isMenuOpen = ref(false);
//     const toggleMenu = (): void => {
//       isMenuOpen.value = !isMenuOpen.value;
//     };

//     //固定メニューハンドル
//     const closeMenu = (): void => {
//       isMenuOpen.value = false;
//     };

//     const handleDocumentClickForMenu = (event: MouseEvent): void => {
//       const menuIcon = document.querySelector('.menu-icon');
//       const dropdownMenu = document.querySelector('.fixed-dropdown-menu');
//       if (
//         menuIcon &&
//         !menuIcon.contains(event.target as Node) &&
//         dropdownMenu &&
//         !dropdownMenu.contains(event.target as Node)
//       ) {
//         closeMenu();
//       }
//     };

//     onMounted(() => {
//       document.addEventListener('click', handleDocumentClickForMenu);
//     });

//     onUnmounted(() => {
//       document.removeEventListener('click', handleDocumentClickForMenu);
//     });

//     // 検索クエリ、ソート順、表示モード
//     const searchQuery = ref('');
//     const sortOrder = ref<'asc' | 'desc'>('desc');
//     const displayMode = ref<'list' | 'panel'>('list');

//     // ドロップダウンのインデックス
//     const dropdownIndex = ref<number | null>(null);

//     const characters = ref<Character[]>([]);

//     // 検索フィルター（タグ）
//     const filteredCharacters = computed(() => {
//       let result = characters.value;
//       if (searchQuery.value) {
//         result = result.filter((character) =>
//           character.tags.some((tag) =>
//             tag.toLowerCase().includes(searchQuery.value.toLowerCase())
//           )
//         );
//       }

//       // ソート（更新日時）
//       if (sortOrder.value === 'asc') {
//         result.sort(
//           (a, b) =>
//             new Date(a.lastUpdated).getTime() -
//             new Date(b.lastUpdated).getTime()
//         );
//       } else {
//         result.sort(
//           (a, b) =>
//             new Date(b.lastUpdated).getTime() -
//             new Date(a.lastUpdated).getTime()
//         );
//       }

//       return result;
//     });

//     // キャラコンテナの追加
//     const addCharacter = (): void => {
//       const newCharacter: Character = {
//         id: characters.value.length + 1,
//         ownerId: userId.value,
//         name: '新しいキャラ',
//         icon: 'https://via.placeholder.com/150',
//         tags: [],
//         lastUpdated: new Date().toISOString(),
//       };
//       characters.value.push(newCharacter);
//       localStorage.setItem('characters', JSON.stringify(characters.value));
//     };

//     // 編集ボタン群
//     const toggleDisplayMode = (): void => {
//       displayMode.value = displayMode.value === 'list' ? 'panel' : 'list';
//     };

//     const goToDetails = (id: number): void => {
//       router.push(`/${userNumber.value}/chara/${id}`);
//     };

//     const addElement = (id: number): void => {
//       console.log(`Adding element to character with ID: ${id}`);
//     };

//     const removeElement = (id: number): void => {
//       console.log(`Removing element from character with ID: ${id}`);
//     };

//     const deleteCharacter = (id: number): void => {
//       characters.value = characters.value.filter(
//         (character) => character.id !== id
//       );
//       localStorage.setItem('characters', JSON.stringify(characters.value));
//     };

//     // 最終更新日時の表示設定
//     const formatDate = (dateString: string): string => {
//       const date = new Date(dateString);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       return `${year}/${month}/${day} ${hours}:${minutes}`;
//     };

//     // ドロップダウンメニュー「︙」
//     const CharaThreeMenu = (index: number): void => {
//       if (dropdownIndex.value === index) {
//         dropdownIndex.value = null;
//       } else {
//         dropdownIndex.value = index;
//       }
//     };

//     //ドロップダウンメニューハンドル
//     const closeDropdown = (): void => {
//       dropdownIndex.value = null;
//     };

//     const handleDocumentClick = (event: MouseEvent): void => {
//       const dropdown = document.querySelector('.dropdown-menu');
//       const editButton = (event.target as HTMLElement).closest('.edit-button');
//       if (dropdown && !dropdown.contains(event.target as Node) && !editButton) {
//         closeDropdown();
//       }
//     };

//     onMounted(() => {
//       document.addEventListener('click', handleDocumentClick);
//       document.addEventListener('scroll', closeDropdown);
//     });

//     onUnmounted(() => {
//       document.removeEventListener('click', handleDocumentClick);
//       document.removeEventListener('scroll', closeDropdown);
//     });

//     return {
//       userId,
//       userNumber,
//       searchQuery,
//       sortOrder,
//       displayMode,
//       filteredCharacters,
//       addCharacter,
//       toggleDisplayMode,
//       goToDetails,
//       addElement,
//       removeElement,
//       deleteCharacter,
//       formatDate,
//       CharaThreeMenu,
//       dropdownIndex,
//       isCurrentPage,
//       isMenuOpen,
//       toggleMenu,
//     };
//   },
// });
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
