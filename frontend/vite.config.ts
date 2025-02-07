import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // エイリアス設定に必要

export default defineConfig({
  base: '/', // 必要に応じて base URL を変更
  plugins: [vue()],
  server: {
    port: 5174, // 固定ポート
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // '@' を 'src' ディレクトリにマッピング
      '@sharetypes': path.resolve(__dirname, '../sharetypes.d.ts'), // sharetypesのパスをエイリアスとして設定
    },
  },
});
