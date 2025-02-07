<template>
  <div v-if="isVisible" class="image-popup-overlay">
    <div class="image-popup-content">
      <button class="close-button" @click="close">×</button>
      <img
        :src="imageSrc"
        class="popup-image"
        :style="imageStyle"
        @wheel.passive="handleWheel"
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const imageScale = ref(1);
    const isDragging = ref(false);
    const imagePosition = ref({ x: 0, y: 0 });
    const startDragPosition = ref({ x: 0, y: 0 });

    // ポップアップの表示状態に応じて body の overflow を制御
    watch(
      () => props.isVisible,
      (newVal) => {
        if (newVal) {
          document.body.style.overflow = 'hidden'; // ポップアップ表示時にスクロールを無効化
        } else {
          document.body.style.overflow = ''; // ポップアップ非表示時にスクロールを有効化
        }
      }
    );

    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        imageScale.value = Math.min(imageScale.value + 0.1, 3);
      } else {
        imageScale.value = Math.max(imageScale.value - 0.1, 0.5);
      }
    };

    const startDrag = (event) => {
      isDragging.value = true;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      startDragPosition.value = {
        x: clientX - imagePosition.value.x,
        y: clientY - imagePosition.value.y,
      };
      if (event.touches) {
        document.addEventListener('touchmove', onDrag, { passive: true });
        document.addEventListener('touchend', stopDrag, { passive: true });
      } else {
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
      }
    };

    const onDrag = (event) => {
      if (isDragging.value) {
        const clientX = event.touches
          ? event.touches[0].clientX
          : event.clientX;
        const clientY = event.touches
          ? event.touches[0].clientY
          : event.clientY;
        imagePosition.value = {
          x: clientX - startDragPosition.value.x,
          y: clientY - startDragPosition.value.y,
        };
      }
    };

    const stopDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchmove', onDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    const imageStyle = computed(() => {
      return {
        transform: `scale(${imageScale.value}) translate(${imagePosition.value.x}px, ${imagePosition.value.y}px)`,
        cursor: isDragging.value ? 'grabbing' : 'grab',
      };
    });

    const close = () => {
      imageScale.value = 1;
      imagePosition.value = { x: 0, y: 0 };
      emit('close');
    };

    return {
      imageScale,
      imageStyle,
      handleWheel,
      startDrag,
      close,
    };
  },
};
</script>

<style scoped>
.image-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.image-popup-content {
  position: relative;
  margin: 0rem;
  padding: 0px;
  border-radius: 0px;
  max-width: 100dvw;
  max-height: 100dvh;
  overflow: hidden;
}

.popup-image {
  margin: 0;
  padding: 0;
  border: none;
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  cursor: grab;
  transition: transform 0.1s ease;
}

.close-button {
  position: absolute;
  top: 1px;
  right: 1px;
  background: var(--top-bar-menu-background-80);
  border-radius: 50%;
  color: var(--top-bar-menu-text);
  border: none;
  font-size: 30px;
  cursor: pointer;
  z-index: 1001;
  padding: 0; /* padding を 0 に */
  width: 35px; /* 幅を指定 */
  height: 35px; /* 高さを指定 */
  display: flex; /* アイコンを中央揃えにする */
  align-items: center;
  justify-content: center;
}
.close-button :hover {
  background: var(--top-bar-menu-background-10);
}
</style>
