// stores/UserStore.ts
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useLayoutStore } from './layoutStore';
import { Features } from '@sharetypes';
import { tokenandmess } from '@/fronttype';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoginFlow: false, // ログインかOR登録か
    token: null as string | null,
    useuserId: '' as string,
    useuserName: null as string | null,
    useuserNumber: '' as string,
    useuserRole: null as string | null,
    useuserEmail: null as string | null,
    useuserGoogle: null as string | null,

    features: [] as Features[], // メニュー機能
    userIcon: '',
    layouttype: '' as string, // レイアウト情報
    menuFetched: false, // キャッシュ用フラグ
  }),
  actions: {
    // トークンをセット
    setToken(token: string) {
      this.token = token;
      // JWTのペイロードをデコード
      const payload: any = jwtDecode(token);

      // 必要なデータを状態に保存
      this.useuserId = payload.user_id;
      this.useuserName = payload.user_name || null;
      this.useuserNumber = payload.user_number || '';
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
      this.useuserEmail = null;
      this.useuserGoogle = null;

      // セッションストレージとクッキーをクリア
      localStorage.removeItem('accessToken');
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },

    /**
     * アクセストークンを取得・更新
     * @returns
     */
    async fetchAccessToken() {
      if (this.token) {
        // トークンが既に存在する場合、そのまま使用
        return this.token;
      }

      try {
        // リフレッシュトークンをクッキーから取得
        const refreshToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('refreshToken='))
          ?.split('=')[1];

        if (!refreshToken) {
          throw new Error('リフレッシュトークンが見つかりません');
        }

        // バックエンドにリフレッシュトークンを送信して新しいアクセストークンを取得
        const response = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // 新しいアクセストークンをセッションストレージに保存
        localStorage.setItem('accessToken', response.data.accessToken);

        // 新しいリフレッシュトークンをクッキーに保存
        document.cookie = `refreshToken=${response.data.refreshToken}; path=/; HttpOnly; Secure; SameSite=Strict`;

        // トークンをセット
        this.setToken(response.data.accessToken);

        return response.data.accessToken;
      } catch (error) {
        console.error('アクセストークンの取得に失敗しました:', error);
        this.clearToken();
        alert('セッションが無効です。再度ログインしてください。');
        window.location.href = '/login'; // ログイン画面にリダイレクト
      }
    },

    /**
     * レイアウトを設定
     * @param newLayout
     */
    setLayout(newLayout: string) {
      this.layouttype = newLayout;
    },

    /**
     * ログアウト処理
     */
    logout() {
      this.token = null;
      this.menuFetched = false;
      localStorage.removeItem('token');
      try {
        axios.post(`${apiBaseUrl}/auth/logout`);
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
      try {
        const response = await axios.post<tokenandmess>(
          `${apiBaseUrl}/auth/login-with-email`,
          {
            email,
            password,
          }
        );
        this.setToken(response.data.token); // トークンを保存
      } catch (error) {
        console.error('メールアドレスまたはパスワードが間違っています:', error);
        throw new Error('メールアドレスまたはパスワードが間違っています');
      }
    },

    /**
     * API: ユーザーデータを保存
     * @param newuserData
     */
    async saveUserData(
      id: string,
      name: string | null,
      icon: string | null
    ): Promise<void> {
      console.log('送信データ:', { id, name, icon });
      try {
        const response = await axios.post<tokenandmess>(
          `${apiBaseUrl}/Auth/user-save`,
          {
            user_id: id,
            user_name: name,
            user_icon: icon,
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'application/json', // JSON形式で送信
            },
          }
        );

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
        const response = await axios.get<{
          features: Features[];
          layout: string;
        }>(`${apiBaseUrl}/menu/getmenu/${userNumber}`);

        // ストアにセット
        this.features = response.data.features;
        this.layouttype = response.data.layout;
        this.menuFetched = true;

        const layoutStore = useLayoutStore();
        layoutStore.setLayout(this.layouttype);
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
        const response = await axios.post<{
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
        this.layouttype = response.data.newLayout;
        this.menuFetched = true;

        const layoutStore = useLayoutStore();
        layoutStore.setLayout(this.layouttype);
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
