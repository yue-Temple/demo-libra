<template>
  <div class="character-detail">
    <!-- ナビゲーションウィンドウ -->
    <nav>
      <ul>
        <li
          v-for="(feature, index) in sortedFeatures"
          :key="index"
          :class="{ current: feature.name === 'charaList' }"
        >
          <router-link :to="`/${userId}/` + feature.name">{{
            feature.title
          }}</router-link>
        </li>
      </ul>
    </nav>

    <!-- 編集ボタン（ログインユーザーかつページの所有者のみ表示） -->
    <div v-if="isLoggedIn && isPageOwner" class="edit-link-container">
      <a href="#" class="edit-link" @click.prevent="toggleEditMode">
        ⚙️{{ isEditing ? 'プレビュー' : '編集' }}
      </a>
    </div>

    <!-- キャラクター詳細 -->
    <div v-if="character" class="character-info">
      <img :src="character.icon" alt="キャラアイコン" class="character-image" />
      <div class="character-details">
        <div v-if="!isEditing" class="preview">
          <div class="row">
            <div class="box">
              <label>名前</label>
              <div class="preview-text">
                {{ character.name || '新しいキャラ' }}
              </div>
            </div>
            <div class="box">
              <label>性別</label>
              <div class="preview-text">{{ character.gender || '' }}</div>
            </div>
            <div class="box">
              <label>年齢</label>
              <div class="preview-text">{{ character.age || '' }}</div>
            </div>
          </div>
          <div class="row">
            <div class="box">
              <label>身長</label>
              <div class="preview-text">{{ character.height || '' }}</div>
            </div>
            <div class="box">
              <label>職業</label>
              <div class="preview-text">{{ character.job || '' }}</div>
            </div>
            <div class="box">
              <label>カラー</label>
              <div class="preview-text">{{ character.color || '' }}</div>
            </div>
          </div>
          <div class="row">
            <div class="box long">
              <label>備考</label>
              <div class="preview-text">{{ character.notes || '' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="edit">
          <div class="row">
            <div class="box">
              <label>名前</label>
              <input v-model="character.name" />
            </div>
            <div class="box">
              <label>性別</label>
              <input v-model="character.gender" />
            </div>
            <div class="box">
              <label>年齢</label>
              <input v-model="character.age" />
            </div>
          </div>
          <div class="row">
            <div class="box">
              <label>身長</label>
              <input v-model="character.height" />
            </div>
            <div class="box">
              <label>職業</label>
              <input v-model="character.job" />
            </div>
            <div class="box">
              <label>カラー</label>
              <input v-model="character.color" />
            </div>
          </div>
          <div class="row">
            <div class="box long">
              <label>備考</label>
              <textarea v-model="character.notes"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="character-not-found">
      キャラクターが見つかりませんでした。
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface Feature {
  label: string;
  name: string;
  value: number;
  disabled: boolean;
  title: string;
}

interface Character {
  id: number;
  ownerId: string | null;
  name: string;
  icon: string;
  gender: string;
  age: string;
  birthday: string;
  height: string;
  job: string;
  color: string;
  notes: string;
}

export default defineComponent({
  name: 'CharacterDetail',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // ログイン状態やID
    const isLoggedIn: Ref<boolean> = ref(
      localStorage.getItem('userLoggedIn') === 'true'
    );
    const userId = ref<string | null>(
      isLoggedIn.value ? localStorage.getItem('userid') : null
    );

    // ページの所有者かどうかを判定するフラグ
    const isPageOwner: Ref<boolean> = ref(true); // ここでは仮にtrueとしていますが、実際のロジックに合わせて設定してください

    // 編集モードの状態
    const isEditing: Ref<boolean> = ref(false);

    // キャラクターのロード関数に型を指定
    const loadCharacter = (id: number): Character | null => {
      const storedCharacters = localStorage.getItem('characters');
      const characters = storedCharacters ? JSON.parse(storedCharacters) : [];
      return (
        characters.find((character: Character) => character.id === id) || null
      );
    };

    const characterId = parseInt(route.params.id as string, 10);
    const character: Ref<Character | null> = ref(loadCharacter(characterId));

    const toggleEditMode = (): void => {
      isEditing.value = !isEditing.value;
    };

    // メニューバーの設定を読み込む
    const features: Ref<Feature[]> = ref(
      JSON.parse(localStorage.getItem('features') || '[]')
    );
    const sortedFeatures = computed(() => {
      return features.value
        .filter((feature) => feature.value !== 0)
        .sort((a, b) => a.value - b.value);
    });

    return {
      isLoggedIn,
      userId,
      isPageOwner,
      character,
      isEditing,
      toggleEditMode,
      sortedFeatures,
    };
  },
});
</script>

<style scoped>
.character-detail {
  margin-top: 50px; /* ヘッダーの高さを避けるために調整 */
  position: relative;
  padding-bottom: 100px; /* 下部にマージンを追加 */
}

.edit-link-container {
  position: relative;
  top: 0px;
  left: 0;
}

.edit-link {
  color: #888;
  text-decoration: none;
  font-size: 14px;
}

.edit-link:hover {
  color: #555;
}

/* 基本情報 */
.character-info {
  display: flex;
  margin-top: 4px;
}

.character-image {
  width: 300px;
  height: 300px;
  margin-right: 10px;
  object-fit: cover;
}

.character-details {
  flex: 1;
}

.preview-text {
  margin-top: 0.8em; /* マージンを追加 */
}

/* ボックス配置 */
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px; /* ボックス同士の距離を調整 */
}

.box {
  background: #ddddde;
  padding: 0.5em; /* パディングを調整 */
  border-radius: 0.2em;
  width: 32.7%;
  box-sizing: border-box;
  position: relative;
  height: 50px; /* ボックスの高さを固定 */
}

.box.long {
  width: 100%;
  height: 50px; /* 長いボックスの高さを固定 */
}

label {
  display: block;
  color: #646d76;
  font-size: 0.7em; /* ラベルの文字サイズを小さく */
  margin-bottom: 0.2em; /* ラベルの下のマージンを調整 */
  position: absolute;
  top: 0.2em; /* ラベルの位置を上に寄せる */
  left: 0.5em;
}

input,
textarea {
  width: 100%;
  padding: 0.3em; /* パディングを調整 */
  border: 1px solid #ccc;
  border-radius: 0.2em;
  font-size: 0.8em; /* 入力欄の文字サイズを小さく */
  margin-top: 1.2em; /* 入力欄の上のマージンを調整 */
  box-sizing: border-box; /* 入力欄の横幅を短くする */
  height: calc(100% - 1.1em); /* 入力欄の高さをボックスの高さに合わせる */
}

textarea {
  height: calc(
    100% - 1.1em
  ); /* テキストエリアの高さをボックスの高さに合わせる */
  resize: none;
}

/* ナビゲーションウィンドウのスタイル */
nav {
  border-bottom: 1px solid #ccc;
  position: fixed; /* 画面上部に固定 */
  top: 0;
  left: 0;
  width: 100%;
  background-color: #c9bc9c; /* 必要に応じて背景色を設定 */
  z-index: 100; /* ナビゲーションバーを上層に表示 */
}

nav ul {
  display: table;
  margin: 0 auto;
  padding: 0;
  width: 80%;
  text-align: center;
}

nav ul li {
  display: table-cell;
  min-width: 50px;
  border-right: 1px solid #ccc;
}

nav ul li:first-child {
  border-left: 1px solid #ccc;
}

nav ul li a {
  display: block;
  width: 100%;
  padding: 10px 0;
  text-decoration: none;
  color: #f2efe7;
}

nav ul li a:hover {
  background-color: #f5f8f7;
  border-bottom: 5px solid #9c1010;
  color: #9c1010;
}

nav ul li.current {
  font-weight: bold;
}

nav ul li.current a {
  border-bottom: 5px solid #9c1010;
  color: #9c1010;
}

.character-not-found {
  margin-top: 20px;
  text-align: center;
  color: #888;
}
</style>
