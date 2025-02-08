import axios from 'axios';
import { useUserStore } from './userStore';
import router from '@/router/router';
import { refreshAccessToken } from './apitoken';


//本番環境にデプロイされている場合、ここを本番サーバーのURLに変更する
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // バックエンドのURL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false; // リフレッシュ中かどうかを管理
let failedQueue: Array<() => void> = []; // 失敗したリクエストを一時的に保持

// インターセプター
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('koko');

    // 401エラー（アクセストークンが無効）の場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // リフレッシュ中なら、完了を待って再試行
        return new Promise((resolve, reject) => {
          failedQueue.push(() => {
            try {
              resolve(apiClient(originalRequest));
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 新しいアクセストークンを取得
        const newAccessToken = await refreshAccessToken();

        // 元のリクエストに新しいアクセストークンを設定
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 保留中のリクエストを再試行
        failedQueue.forEach((callback) => callback());
        failedQueue = [];

        return apiClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュに失敗した場合、ログアウト処理
        const userStore = useUserStore();
        userStore.clearToken();
        router.push('/login'); // ログイン画面にリダイレクト
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);