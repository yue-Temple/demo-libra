import axios from 'axios';

//本番環境にデプロイされている場合、ここを本番サーバーのURLに変更する
const API_BASE_URL = 'http://localhost:3000'; // バックエンドのURL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// メールアドレス＋パスワードログインAPIクライアント
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login-with-email', {
      email,
      password,
    });
    return response.data; // トークンを返す
  } catch (error) {
    throw new Error('メールアドレスもしくはパスワードが間違っています');
  }
};

// GoogleログインAPIクライアント
export const loginWithGoogle = async (google_user_id: string) => {
  try {
    const response = await apiClient.post('/auth/login-with-google', {
      google_user_id,
    });
    return response.data;
  } catch (error) {
    throw new Error('Google認証に失敗しました');
  }
};

// メールアドレス＋パスワード登録APIクライアント
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/register-with-email', {
      email,
      password,
    });
    return response.data; // バックエンドから返されるuser_idを含むレスポンス
  } catch (error) {
    throw new Error('メール登録に失敗しました');
  }
};

// Google登録APIクライアント
export const registerWithGoogle = async (google_user_id: string) => {
  try {
    const response = await apiClient.post('/auth/register-with-google', {
      google_user_id,
    });
    return response.data; // バックエンドから返されるuser_idを含むレスポンス
  } catch (error) {
    throw new Error('Google登録に失敗しました');
  }
};

// ログアウトAPIクライアント
export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error('ログアウトに失敗しました');
  }
};

export const saveUser = async (
  user_id: string,
  username: string,
  image_url: string,
  image_s3_path: string
): Promise<any> => {
  try {
    const response = await apiClient.post('/user-save', {
      user_id,
      username,
      image_url,
      image_s3_path,
    });

    // レスポンスをログ出力（必要に応じて削除）
    console.log('ユーザーデータ保存成功', response.data);

    // レスポンスデータを返す
    return response.data;
  } catch (error) {
    // エラー時にバックエンドからのエラーメッセージを含める
    const errorMessage =
      (error as any).response?.data?.message ||
      'ユーザーデータ保存に失敗しました';
    console.error('ユーザーデータ保存に失敗しました', errorMessage);
    throw new Error(errorMessage);
  }
};

// メニュー保存APIクライアント
export const saveMenu = async (
  userId: string,
  featureValues: { value: number; title: string }[]
) => {
  try {
    const response = await apiClient.post('/menu/save', {
      userId,
      featureValues,
    });
    return response.data;
  } catch (error) {
    throw new Error('メニュー保存に失敗しました');
  }
};

// メニュー取得APIクライアント
export const getMenu = async (token: string) => {
  try {
    const response = await apiClient.get('/menu/getmenu', {
      headers: {
        Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('メニュー取得に失敗しました');
  }
};
