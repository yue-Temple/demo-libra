import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import router from '@/router/router';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// リフレッシュトークンを使用してアクセストークンを再発行する関数
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('refreshToken='))
    ?.split('=')[1];

  if (!refreshToken) {
    throw new Error('リフレッシュトークンが見つかりません');
  }

  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
    refreshToken,
  });

  // 新しいアクセストークンをセッションストレージに保存
  localStorage.setItem('accessToken', response.data.accessToken);

  // 新しいリフレッシュトークンをHTTPクッキーに保存
  document.cookie = `refreshToken=${response.data.refreshToken}; path=/; HttpOnly; Secure; SameSite=Strict`;

  return response.data.accessToken;
};

let isRefreshing = false; // リフレッシュ中かどうかを管理
let failedQueue: Array<() => void> = []; // 失敗したリクエストを一時的に保持

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

export default apiClient;
