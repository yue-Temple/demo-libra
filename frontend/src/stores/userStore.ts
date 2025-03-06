// stores/UserStore.ts
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { useLayoutStore } from './layoutStore';
import { Features } from '@sharetypes';
import { apiClient } from './apiClient';
import { convertToURL } from '@/rogics/imageProcess';
import { getDeviceId } from '@/rogics/uuid';
import router from '@/router/router';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoginFlow: false, // ログインかOR登録か
    token: null as string | null,
    useuserId: '' as string,
    useuserNumber: '' as string,
    useuserName: null as string | null,
    useuseruserIcon: null as string | null,
    useuserRole: null as string | null,
    useuserEmail: null as string | null,
    useuserGoogle: null as string | null,

    features: [] as Features[], // メニュー機能

    menuFetched: false, // キャッシュ用フラグ
  }),
  actions: {
    // トークンをセット ※アプリマウント時に実行
    setToken(token: string) {
      this.token = token;
      // JWTのペイロードをデコード
      const payload: any = jwtDecode(token);

      // 必要なデータを状態に保存
      this.useuserId = payload.user_id;
      this.useuserNumber = payload.user_number || '';
      this.useuserName = payload.user_name || null;
      this.useuseruserIcon = payload.user_icon || null;
      this.useuserRole = payload.user_role;
      this.useuserEmail = payload.user_email || null;
      this.useuserGoogle = payload.user_googleid || null;
    },

    // トークンをリセット
    clearToken() {
      this.token = null;
      this.useuserId = '';
      this.useuserNumber = '';
      this.useuserName = null;
      this.useuseruserIcon = null;
      this.useuserRole = '';
      this.useuserEmail = null;
      this.useuserGoogle = null;

      // ローカルストレージをクリア
      localStorage.clear();
    },

    /**
     * オーナー確認
     * @param routeuserNumber
     * @returns
     */
    checkOwner(routeuserNumber: string | string[]) {
      if (this.useuserNumber == routeuserNumber) {
        return true;
      } else {
        return false;
      }
    },

    // メールログイン・ログアウト-------------------------------------------------------------------------
    /**
     * API: メールアドレスで仮登録
     * @param email
     * @returns エラーメッセージ（エラー時）
     */
    async registerWithEmail(email: string): Promise<string | void> {
      try {
        // 仮登録APIにリクエストを送信
        await apiClient.post(`${apiBaseUrl}/auth/register-with-email`, {
          email,
        });

        // 成功時は何も返さない
        return;
      } catch (error) {
        const err = error as any; // error を any 型にキャスト

        // エラーメッセージを抽出
        let errorMessage = '仮登録に失敗しました。再度お試しください。'; // デフォルトのエラーメッセージ

        if (err.response && err.response.data && err.response.data.error) {
          // APIからのエラーメッセージを取得
          errorMessage = err.response.data.error;
        } else if (err.message) {
          // ネットワークエラーなどのメッセージを取得
          errorMessage = err.message;
        }

        // エラーメッセージを返す
        return errorMessage;
      }
    },

    /**
     * API: ワンパス認証コードの検証と本登録
     * @param email
     * @param password
     * @param authCode
     */
    async verifyEmail(
      email: string,
      password: string,
      authCode: string
    ): Promise<void> {
      const deviceId = getDeviceId(); // デバイスIDを取得

      try {
        // 本登録APIにリクエストを送信
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
        }>(`${apiBaseUrl}/auth/verify-and-complete-registration`, {
          email,
          password,
          code: authCode,
          deviceId,
        });

        // アクセストークンとリフレッシュトークンを保存
        localStorage.setItem('accessToken', response.data.accessToken);

        // ストアにトークンをセット
        this.setToken(response.data.accessToken);

        // 成功メッセージを表示
        alert('本登録が完了しました。ログインしました。');
      } catch (error) {
        console.error('本登録エラー:', error);
        alert(
          '本登録に失敗しました。認証コードまたはパスワードを確認してください。'
        );
      }
    },

    /**
     * API:メールアドレス＋パスワードでログイン
     * @param email
     * @param password
     */
    async loginWithEmail(email: string, password: string): Promise<void> {
      const deviceId = getDeviceId();
      try {
        const response = await apiClient.post(
          `${apiBaseUrl}/auth/login-with-email`,
          {
            email,
            password,
            deviceId,
          }
        );
        console.log(response.data.token.accessToken);
        // 返されたアクセストークンをローカルストレージに保存
        localStorage.setItem('accessToken', response.data.token.accessToken);
        this.setToken(response.data.token.accessToken); // トークンを保存
      } catch (error: any) {
        throw new Error('メールアドレスまたはパスワードが間違っています');
      }
    },

    /**
     * ログアウト処理
     */
    async logout() {
      try {
        await apiClient.post(`${apiBaseUrl}/auth/logout`);
        // 削除処理
        this.clearToken();
        this.menuFetched = false;
        router.push('/');
      } catch (error) {
        console.error('ログアウトに失敗しました:', error);
      }
    },

    // メニュー＋レイアウト-------------------------------------------------------------------------
    /**
     * API: メニューとレイアウトの取得
     * @param userNumber
     */
    async fetchFeatures(userNumber: number): Promise<void> {
      // キャッシュがあれば終了
      if (this.menuFetched) return;

      try {
        const response = await apiClient.get<{
          features: Features[];
          layout: string;
        }>(`${apiBaseUrl}/menu/getmenu/${userNumber}`);

        // ストアにセット
        this.features = response.data.features;
        const layoutStore = useLayoutStore();
        layoutStore.setLayout(response.data.layout);
        this.menuFetched = true;
      } catch (error) {
        console.error('データベースからの取得に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:メニューとレイアウトの保存
     * @param newFeatures
     * @param newLayout
     * @returns
     */
    async saveMenuAndLayout(
      newFeatures: Features[],
      newLayout: string
    ): Promise<void> {
      console.log(newFeatures);
      try {
        const response = await apiClient.post<{
          newFeatures: Features[];
          newLayout: string;
        }>(
          `${apiBaseUrl}/menu/savemenu`,
          {
            // リクエストボディ
            feature_value: newFeatures,
            changed_layout: newLayout,
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // ストアにセット
        this.features = response.data.newFeatures;
        const layoutStore = useLayoutStore();
        layoutStore.setLayout(response.data.newLayout);
        this.menuFetched = true;
      } catch (error) {
        console.error('データベースからの取得に失敗しました', error);
        throw error;
      }
    },
    // ユーザーデータ-------------------------------------------------------------------------
    /**
     * API: ユーザーデータを保存 ※トークンが更新される
     * @param id
     * @param name
     * @param iconurl
     * @param uploadFile
     */
    async saveUserData(
      id: string,
      name: string | null,
      iconurl: string | null,
      uploadFile: File | null
    ): Promise<void> {
      let deleteiconurl: string | null = null; //更新の場合削除するべき画像URL
      let newiconurl: string | null = iconurl;

      // 画像更新があった場合
      if (uploadFile != null) {
        deleteiconurl = this.useuseruserIcon;
        const userNumber = Number(this.useuserNumber);
        const result = await convertToURL(uploadFile, userNumber, 'user');
        newiconurl = result.cdnUrl; // 新しい画像をセット
      }

      try {
        const response = await apiClient.post<{
          newtoken: string;
          messege: string;
        }>(
          `${apiBaseUrl}/Auth/user-save`,
          {
            user_id: id,
            user_name: name,
            user_icon: newiconurl,
            delete_iconurl: deleteiconurl,
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'application/json', // JSON形式で送信
            },
          }
        );

        // トークンを更新
        this.token = response.data.newtoken;
        localStorage.setItem('accessToken', response.data.newtoken);
        this.setToken(response.data.newtoken);

        console.log('設定が保存されました');
      } catch (error) {
        console.error('設定の保存に失敗しました', error);
        throw error;
      }
    },

    /**
     * アカウント削除
     */
    async deleteAccount(): Promise<void> {
      try {
        await apiClient.delete<void>(`${apiBaseUrl}/auth/user-delete`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json', // JSON形式で送信
          },
        });

        this.clearToken(); // ローカルストレージクリア
        console.log('アカウント削除完了');
      } catch (error) {
        console.error('アカウントの削除に失敗しました', error);
        throw error;
      }
    },
  },
});
