import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import { createPinia } from 'pinia'; // Piniaのインポート
import Toast, { PluginOptions } from 'vue-toastification';
import 'vue-toastification/dist/index.css'; // スタイルをインポート

// Vueアプリケーションの作成
const app = createApp(App);

// トースト通知の設定
const toastOptions: PluginOptions = {
  timeout: 3000, // トーストの表示時間（ミリ秒）
  closeOnClick: true, // クリックでトーストを閉じる
  pauseOnFocusLoss: true, // ウィンドウがフォーカスを失った時に一時停止
  pauseOnHover: false, // ホバー時に一時停止
  showCloseButtonOnHover: false, // ホバー時に閉じるボタンを表示
  hideProgressBar: false, // プログレスバーを非表示にする
  closeButton: 'button', // 閉じるボタンのタイプ
  icon: true, // アイコンを表示
  rtl: true, // 右から左のレイアウト
  transition: 'Vue-Toastification__fade',
};

// 必要なプラグインを適用
app.use(router); // routerを適用
app.use(createPinia()); // Piniaを適用
app.use(Toast, toastOptions); // プラグインを適用

// アプリケーションをマウント
app.mount('#app');
