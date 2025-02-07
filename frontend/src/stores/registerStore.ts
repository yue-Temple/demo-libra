// stores/registerStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useRegisterStore = defineStore('register', {
  state: () => ({
    registrationError: null as string | null,
  }),
  actions: {
    /**
     * ローカルストレージにトークンを保存
     * @param token
     */
    saveTokenToLocalStorage(token: string) {
      localStorage.setItem('token', token);
    },

    /**
     * API:メールアドレス＋パスワードでユーザー登録
     * @param email
     * @param password
     */
    async registerWithEmail(email: string, password: string): Promise<void> {
      try {
        const response = await axios.post<{ token: string }>(
          `${apiBaseUrl}/auth/register-with-email`,
          {
            email,
            password,
          }
        );
        // 返されたトークンをローカルストレージに保存
        this.saveTokenToLocalStorage(response.data.token);
      } catch (error) {
        this.registrationError = 'メール登録に失敗しました';
        console.error('メール登録エラー:', error);
        throw new Error(this.registrationError);
      }
    },

    // /**
    //  * API:Google アカウントでユーザー登録
    //  * @param google_user_id
    //  */
    // async registerWithGoogle(google_user_id: string): Promise<void> {
    //   try {
    //     const response = await axios.post<{ token: string }>(
    //       `${apiBaseUrl}/auth/register-with-google`,
    //       {
    //         google_user_id,
    //       }
    //     );
    //     // 返されたトークンをローカルストレージに保存
    //     this.saveTokenToLocalStorage(response.data.token);
    //   } catch (error) {
    //     this.registrationError = 'Google 登録に失敗しました';
    //     console.error('Google 登録エラー:', error);
    //     throw new Error(this.registrationError);
    //   }
    // },
  },
});
