<template>
    <div class="popup">
      <!-- 通常のポップアップ内容 -->
      <div class="popup-content">
        <div class="h2-cancel">
          <!-- 見出し -->
          <h2>シェア設定</h2>
          <!-- キャンセルボタン -->
          <button class="cancel" @click="closePopup">✖</button>
        </div>
  
        <div class="scrollable-content">
          <!-- 画像あり・なしのトグルボタン -->
          <div class="toggle-group">
            <button
              class="toggle-button"
              :class="{ active: imageOption === 'あり' }"
              @click="imageOption = 'あり'"
            >
              画像あり
            </button>
            <button
              class="toggle-button"
              :class="{ active: imageOption === 'なし' }"
              @click="imageOption = 'なし'"
            >
              画像なし
            </button>
          </div>
          
          <!-- レポートあり・なしのトグルボタン -->
          <div class="toggle-group">
            <button
              class="toggle-button"
              :class="{ active: reportOption === 'あり' }"
              @click="reportOption = 'あり'"
            >
              レポートあり
            </button>
            <button
              class="toggle-button"
              :class="{ active: reportOption === 'なし' }"
              @click="reportOption = 'なし'"
            >
              レポートなし
            </button>
          </div>
  
          <!-- URLリンクあり・なしのトグルボタン -->
          <div class="toggle-group">
            <button
              class="toggle-button"
              :class="{ active: linkOption === 'あり' }"
              @click="linkOption = 'あり'"
            >
              URLリンクあり
            </button>
            <button
              class="toggle-button"
              :class="{ active: linkOption === 'なし' }"
              @click="linkOption = 'なし'"
            >
              URLリンクなし
            </button>
          </div>
        </div>
  
        <!-- 保存ボタン -->
        <div class="form-bottom">
            <p style="font-size: 0.8rem; color: #ccc;">※画像は同時にコピーできません※</p>
          <div class="form-actions">
            <!-- 画像をクリップボードにコピーするボタン -->
            <button
              type="button"
              class="ok"
              :disabled="imageOption !== 'あり' || !props.cover"
              @click="copyImageToClipboard"
            >
              <b>画像をクリップボードにコピー</b>
            </button>
  
            <!-- 通常のクリップボードにコピーするボタン -->
            <button type="submit" class="ok" @click="copyContent">
              <b>レポート,URLをクリップボードにコピー</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { PropType, ref } from 'vue';
  
  const props = defineProps({
    cover: {
      type: [String, File] as PropType<string | File | null>,
      required: false,
      default: null,
    },
    report: {
      type: String as () => string | null | undefined,
      required: false,
    },
    pageUrl: {
      type: String as () => string,
      required: true,
    },
  });
  
  const emit = defineEmits(['share-popup-close']);
  
  const reportOption = ref('あり');
  const imageOption = ref('あり');
  const linkOption = ref('あり');
  
  // 画像をBlob形式で取得
  const getImageBlob = async (): Promise<Blob | null> => {
    if (!props.cover) return null;
  
    if (typeof props.cover === 'string') {
      // URLの場合、fetchで画像を取得
      try {
        const response = await fetch(props.cover);
        return await response.blob();
      } catch (error) {
        console.error('画像の取得に失敗しました', error);
        return null;
      }
    } else {
      // Fileオブジェクトの場合、そのままBlobとして返す
      return props.cover;
    }
  };
  
  // 画像をPNG形式に変換してクリップボードにコピー
  const copyImageToClipboard = async () => {
    try {
      if (props.cover) {
        const imageBlob = await getImageBlob();
        if (imageBlob) {
          // BlobをImageオブジェクトに変換
          const img = new Image();
          const objectURL = URL.createObjectURL(imageBlob);
          img.src = objectURL;
  
          // 画像が読み込まれたらCanvasに描画
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
  
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
  
              // CanvasからPNG形式のBlobを取得
              canvas.toBlob(async (blob) => {
                if (blob) {
                  // クリップボードにコピー
                  await navigator.clipboard.write([
                    new ClipboardItem({
                      'image/png': blob,
                    }),
                  ]);
                  alert('画像をクリップボードにコピーしました');
                } else {
                  alert('画像の変換に失敗しました');
                }
              }, 'image/png'); // PNG形式に変換
            }
  
            // ObjectURLを解放
            URL.revokeObjectURL(objectURL);
          };
  
          // 画像の読み込みエラーをハンドル
          img.onerror = () => {
            alert('画像の読み込みに失敗しました');
            URL.revokeObjectURL(objectURL);
          };
        }
      }
    } catch (error) {
      console.error('画像のクリップボードへのコピーに失敗しました', error);
      alert('画像のコピーに失敗しました');
    }
  };
  
  // 通常のクリップボードにコピー
  const copyContent = async () => {
    try {
      const textContent = [];
  
      // レポートの内容を追加
      if (reportOption.value === 'あり' && props.report) {
        textContent.push(props.report);
      }
  
      // URLリンクの内容を追加
      if (linkOption.value === 'あり' && props.pageUrl) {
        textContent.push(props.pageUrl);
      }
  
      // クリップボードに書き込む
      if (textContent.length > 0) {
        await navigator.clipboard.writeText(textContent.join('\n'));
        alert('クリップボードにコピーしました');
      } else {
        alert('コピーする内容がありません');
      }
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました', error);
      alert('予期せぬエラーが発生しました');
    }
  };
  
  // ポップアップを閉じる
  const closePopup = () => {
    emit('share-popup-close');
  };
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
  }
  
  .popup-content {
    background-color: var(--page-background);
    padding: 20px;
    border-radius: 5px;
    width: 500px;
    max-width: 65dvw;
    height: 420px;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 2px 2px var(--shadow),
      0 -2px 2px var(--shadow),
      2px 0 2px var(--shadow),
      -2px 0 2px var(--shadow);
  }
  
  @media (max-width: 600px) {
    .popup-content {
      margin-top: 40px;
      width: 90dvw;
      max-width: 90dvw;
      max-height: 75vh;
    }
  }
  
  .scrollable-content {
    overflow-y: auto;
    flex-grow: 1;
    padding: 5px;
  }
  
  .scrollable-content::-webkit-scrollbar {
    width: 2px;
  }
  
  .scrollable-content::-webkit-scrollbar-thumb {
    background-color: var(--page-text-sub);
    border-radius: 10px;
  }
  
  h2 {
    margin: 0 0 0 1rem;
    padding-top: 3.5px;
    font-size: 24px;
  }
  
  .h2-cancel {
    display: flex;
    margin-bottom: 0.5rem;
  }
  
  .cancel {
    color: var(--page-button);
    background-color: transparent;
    border: none;
    font-size: 1.7rem;
    cursor: pointer;
    margin-left: auto;
    padding-top: 0;
  }
  
  .cancel:hover {
    color: var(--page-button-sub);
  }
  
  .form-actions {
    display: flex;
    flex-direction: column; /* ボタンを縦に並べる */
    gap: 10px;
    margin-left: auto;
    margin-top: -15px;
  }
  
  .form-actions button {
    padding: 8px 16px;
    margin-top: .5rem;
    margin-right: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .ok {
    background-color: var(--page-button);
    color: var(--page-buttontext);
  }
  
  /* 無効化されたボタンのスタイル */
  .form-actions button:disabled {
    background-color: #ccc; /* グレーアウト */
    color: #666; /* 文字色を薄く */
    cursor: not-allowed; /* カーソルを変更 */
  }
  
  /* トグルボタンのスタイル */
  .toggle-group {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .toggle-button {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
    text-align: center;
  }
  
  .toggle-button.active {
    background-color: var(--page-button);
    color: white;
    border-color: var(--page-button);
  }
  </style>