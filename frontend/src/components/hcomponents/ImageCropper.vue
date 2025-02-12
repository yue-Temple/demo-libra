<template>
  <div class="cropping-overlay">
    <div class="cropping-container">
      <div class="trim">
        <vue-cropper
          ref="cropper"
          :src="originalImage"
          :aspect-ratio="NaN"
          :view-mode="2"
          :guides="true"
          :background="true"
          :auto-crop-area="1.0"
          :min-container-width="250"
          :min-container-height="180"
          :responsive="true"
          :restore="true"
          :check-cross-origin="false"
          :zoomable="true"
          :wheel-zoom-ratio="0.3"
          @ready="onCropperReady"
        ></vue-cropper>
      </div>
      <!-- トリミング比率選択ボタン -->
      <div class="aspect-ratio-buttons">
        <button
          :class="{ active: currentAspectRatio === 16 / 9 }"
          @click="setAspectRatio(16 / 9)"
        >
          16:9
        </button>
        <button
          :class="{ active: currentAspectRatio === 1 }"
          @click="setAspectRatio(1)"
        >
          1:1
        </button>
        <button
          :class="{ active: currentAspectRatio === 8 / 9 }"
          @click="setAspectRatio(8 / 9)"
        >
          8:9
        </button>
        <button
          :class="{ active: currentAspectRatio === 3 / 4 }"
          @click="setAspectRatio(3 / 4)"
        >
          3:4
        </button>
        <button
          :class="{ active: isNaN(currentAspectRatio) }"
          @click="setAspectRatio(NaN)"
        >
          Free
        </button>
      </div>
      <div class="cropping-actions">
        <button type="button" @click.stop="cancel">キャンセル</button>
        <button type="button" @click="apply">適用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps({
  originalImage: String,
});

const emit = defineEmits(['cancel', 'cropped']);

const cropper = ref(null);
const currentAspectRatio = ref(NaN);

const setAspectRatio = (ratio) => {
  currentAspectRatio.value = ratio;
  if (cropper.value) {
    cropper.value.setAspectRatio(ratio);
  }
};

// 準備処理
const onCropperReady = () => {
  if (cropper.value && cropper.value.cropper) {
    const trimElement = document.querySelector('.trim');
    if (trimElement) {
      // クロスオリジン設定
      const image = cropper.value.cropper.image;
      if (image) {
        image.crossOrigin = 'anonymous'; // クロスオリジン設定
      }

      // アスペクト比の設定
      cropper.value.cropper.setAspectRatio(currentAspectRatio.value);

      // トリミングボックスのサイズ設定
      cropper.value.cropper.setCropBoxData({
        width: trimElement.clientWidth,
        height: trimElement.clientHeight,
      });
    }
  }
};

// ウィンドウリサイズ時の対応
onMounted(() => {
  window.addEventListener('resize', onCropperReady);
  document.body.classList.add('cropping-active'); // bodyスクロール無効化
});

// コンポーネント破棄時の処理
onUnmounted(() => {
  window.removeEventListener('resize', onCropperReady); // イベントリスナーを削除
  document.body.classList.remove('cropping-active'); // bodyスクロール有効化
});

const cancel = () => emit('cancel');
const apply = () => {
  cropper.value.getCroppedCanvas().toBlob((blob) => {
    const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
    emit('cropped', URL.createObjectURL(file), file); //画像URLと画像データを親に渡す
  });
};
</script>

<style>
/* 背後のスクロールを無効化 */
body.cropping-active {
  overflow: hidden;
}
</style>

<style scoped>
.cropping-overlay {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300 !important;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.cropping-container {
  background-color: var(--page-background);
  padding: 20px;
  border-radius: 8px;
  max-width: 50%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 2px 2px var(--shadow),
    0 -2px 2px var(--shadow),
    2px 0 2px var(--shadow),
    -2px 0 2px var(--shadow);
}

@media (max-width: 600px) {
  .cropping-container {
    max-width: 80%;
  }
}

.trim {
  position: relative;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: transparent;
}

.vue-cropper {
  max-width: 100%;
  min-height: 100%;
  width: 100%; /* 追加 */
  height: auto; /* 追加 */
}

.aspect-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 20px;
}
.aspect-ratio-buttons button {
  padding: 8px 16px;
  border: 1px solid var(--page-button);
  border-radius: 4px;
  background-color: transparent;
  color: var(--page-button);
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box; /* ボーダーを高さに含める */
  height: 35px; /* 高さを固定 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.aspect-ratio-buttons button:hover {
  background-color: var(--page-button);
  color: var(--page-buttontext);
}

.cropping-actions {
  display: flex;
  justify-content: flex-end; /* ボタンを右寄せ */
  gap: 8px; /* ボタン間の余白 */
}
.cropping-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background-color: var(--page-button);
  color: white;
  cursor: pointer;
  transition: opacity 0.3s;
}
.cropping-actions button:hover {
  opacity: 0.9;
}
</style>
