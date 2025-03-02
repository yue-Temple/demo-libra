import { apiClient } from './apiClient';
import axios from 'axios'; // axios をインポート

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const apipassreset = {
  /**
   * パスワードリセット用のワンタイムパスワード（OTP）を送信する
   * @param email ユーザーのメールアドレス
   * @returns 成功メッセージまたはエラーメッセージ
   */
  passwordreset: async (email: string): Promise<string> => {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/auth/password-reset/request`,
        { email }
      );
      return response.data.message; // 成功メッセージを返す
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError の場合
        if (error.response) {
          throw new Error(error.response.data.message || 'ワンタイムパスワードの送信に失敗しました。');
        } else {
          throw new Error('ネットワークエラーが発生しました。');
        }
      } else {
        // その他のエラーの場合
        throw new Error('予期せぬエラーが発生しました。');
      }
    }
  },

  /**
   * ユーザーが入力したOTPを検証する
   * @param email ユーザーのメールアドレス
   * @param code ユーザーが入力したOTP
   * @returns 成功メッセージまたはエラーメッセージ
   */
  verifyonepass: async (email: string, code: string): Promise<string> => {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/auth/password-reset/verify`,
        { email, code }
      );
      return response.data.message; // 成功メッセージを返す
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError の場合
        if (error.response) {
          throw new Error(error.response.data.message || 'ワンタイムパスワードの認証に失敗しました。');
        } else {
          throw new Error('ネットワークエラーが発生しました。');
        }
      } else {
        // その他のエラーの場合
        throw new Error('予期せぬエラーが発生しました。');
      }
    }
  },

  /**
   * 新しいパスワードを設定する
   * @param email ユーザーのメールアドレス
   * @param newpassword 新しいパスワード
   * @returns 成功メッセージまたはエラーメッセージ
   */
  setNewPassword: async (email: string, newpassword: string): Promise<string> => {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/auth/password-reset/set`,
        { email, newpassword }
      );
      return response.data.message; // 成功メッセージを返す
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // AxiosError の場合
        if (error.response) {
          throw new Error(error.response.data.message || 'パスワードの更新に失敗しました。');
        } else {
          throw new Error('ネットワークエラーが発生しました。');
        }
      } else {
        // その他のエラーの場合
        throw new Error('予期せぬエラーが発生しました。');
      }
    }
  },
};