// stores/UserStore.ts
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { useLayoutStore } from './layoutStore';
import { Features } from '@sharetypes';
import { tokenandmess } from '@/fronttype';
import { apiClient } from './apiClient';
import { convertToURL } from '@/rogics/imageProcess';
import { getDeviceId } from '@/rogics/uuid';

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

      // ストレージとクッキーをクリア
      localStorage.removeItem('accessToken');
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },

    /**
     * ログアウト処理
     */
    logout() {
      this.token = null;
      this.menuFetched = false;
      localStorage.removeItem('token');
      try {
        apiClient.post(`${apiBaseUrl}/auth/logout`);
      } catch (error) {
        console.error('ログアウトに失敗しました:', error);
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
        const response = await apiClient.post<tokenandmess>(
          `${apiBaseUrl}/auth/login-with-email`,
          {
            email,
            password,
            deviceId,
          }
        );
        this.setToken(response.data.token); // トークンを保存
      } catch (error) {
        console.error('メールアドレスまたはパスワードが間違っています:', error);
        throw new Error('メールアドレスまたはパスワードが間違っています');
      }
    },

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
        const icon_object_key = result.objectKey;
        newiconurl = result.cdnUrl; // 新しい画像をセット
      }

      try {
        const response = await apiClient.post<tokenandmess>(
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
        this.token = response.data.token;
        localStorage.setItem('accessToken', response.data.token);
        this.setToken(response.data.token);

        console.log('設定が保存されました', response.data);
      } catch (error) {
        console.error('設定の保存に失敗しました', error);
        throw error;
      }
    },

    /**
     * API: メニューとレイアウトの取得
     * @param userNumber
     */
    async fetchFeatures(userNumber: number): Promise<void> {
      if (this.menuFetched) {
        return;
      }
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
  },
});
