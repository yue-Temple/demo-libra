import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // エイリアス設定に必要

export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sharetypes': path.resolve(__dirname, '../sharetypes.d.ts'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/chunks/[name].[hash].js', // チャンクファイルの出力先
        entryFileNames: 'assets/entry/[name].[hash].js', // エントリーファイルの出力先
        assetFileNames: 'assets/styles/[name].[hash].[ext]', // CSS ファイルの出力先
      },
    },
  },
  assetsInclude: ['**/*.webp'], // .webp ファイルを静的アセットとして明示的に指定
});
