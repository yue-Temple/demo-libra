import axios from 'axios';
import { apiClient } from './apiClient';

/**
 * API:アクセストークンの更新
 * リフレッシュトークンはクッキーで送信
 * @returns 
 */
export const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await apiClient.post<{ accessToken: string }>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
      {}, // ボディは空（リフレッシュトークンはクッキーで送信）
      { withCredentials: true } // クッキーを送信するために必要
    );

    // 新しいアクセストークンをローカルストレージに保存
    localStorage.setItem('accessToken', response.data.accessToken);

    return response.data.accessToken;
  } catch (error) {
    // AxiosErrorかどうかを確認
    if (axios.isAxiosError(error)) {
      // 401エラーの場合
      if (error.response?.status === 401) {
        throw new Error('無効なリフレッシュトークンです');
      }
      // その他のAxiosエラーの場合
      throw new Error('アクセストークンの再発行に失敗しました');
    }

    // AxiosError以外のエラーの場合
    throw new Error('予期せぬエラーが発生しました');
  }
};
