// src/routes/auth.ts
import express from 'express';
import { Request, Response } from 'express';
import { AuthMailService } from '../services/AuthMailService';
import { AuthGoogleService } from '../services/AuthGoogleService';
import { AuthTokenService, logout } from '../services/AuthTokenService';
import { deleteFromR2 } from '../services/R2Service';
import { saveUser } from '../services/UserService';
import { RefreshToken } from '../entity/RefreshToken';

const router = express.Router();

const mailService = new AuthMailService();
const googleService = new AuthGoogleService();
const authTokenService = new AuthTokenService();

// 環境変数の存在確認
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REGISTER_REDIRECT_URI = process.env.REGISTER_REDIRECT_URI;
const LOGIN_REDIRECT_URI = process.env.LOGIN_REDIRECT_URI;
if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !REGISTER_REDIRECT_URI ||
  !LOGIN_REDIRECT_URI
) {
  throw new Error('Google OAuth 関連の環境変数が設定されていません');
}

const FRONTEND_URL = process.env.FRONTEND_URL;

// ★登録--------------------------------------------------------------------------------------------------------------------------------------------
// メールアドレス＋パスワード登録APIエンドポイント
router.post('/register-with-email', async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    // authService.registerWithEmail を1回呼び出して、token を取得
    const token = await mailService.registerWithEmail(
      email,
      password,
      deviceId,
      res
    );

    // token をフロントエンドに返す
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// グーグルアカウントによる登録
router.get('/google/register/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const receivedState = req.query.state as string;
    // stateを分解して検証
    const [state, deviceId] = receivedState.split(':');

    if (!code || !state || !deviceId) {
      return res
        .status(400)
        .json({ message: '無効な認可コードまたは状態です' });
    }

    // 認可コードを使用して登録処理を実行
    const { accessToken } =
      await googleService.registerWithGoogle(code, deviceId, res);

    // クッキーをクリア
    res.clearCookie('oauth_state');
    res.clearCookie('device_id');

    // フロントエンドにリダイレクト（トークン付与）
    res.redirect(
      `${FRONTEND_URL}/auth-success?accessToken=${encodeURIComponent(accessToken)}&isLoginFlow=${'false'}`
    );
  } catch (error) {
    console.error('認可コード処理エラー:', error);
    // 型ガードを使用してエラーメッセージを取得
    let errorMessage = '不明なエラー';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // エラーページにリダイレクト
    res.redirect(
      `${FRONTEND_URL}/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
});

// ★ログイン--------------------------------------------------------------------------------------------------------------------------------------------
// メールアドレス＋パスワードログインAPIエンドポイント
router.post('/login-with-email', async (req, res) => {
  try {
    const { email, password, deviceId, } = req.body;
    const token = await mailService.loginWithEmail(email, password, deviceId, res); // トークンを受け取る

    res.status(200).json({ message: 'メールログイン成功', token }); // トークンを含めて返す
  } catch (error) {
    res.status(401).json({
      message: 'メールアドレスもしくはパスワードが間違っています',
      error: (error as Error).message,
    });
  }
});

// グーグルアカウントによるログイン
router.get('/google/login/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const receivedState = req.query.state as string;
    // stateを分解して検証
    const [state, deviceId] = receivedState.split(':');

    if (!code || !state || !deviceId) {
      return res
        .status(400)
        .json({ message: '無効な認可コードまたは状態です' });
    }

    // 認可コードを使用してログイン処理を実行
    const { accessToken } = await googleService.loginWithGoogle(
      code,
      deviceId,
      res,
    );

    // クッキーをクリア
    res.clearCookie('oauth_state');

    // フロントエンドにリダイレクト（トークン付与）
    res.redirect(
      `${FRONTEND_URL}/auth-success?accessToken=${encodeURIComponent(accessToken)}&isLoginFlow=${'true'}`
    );
  } catch (error) {
    console.error('認可コード処理エラー:', error);
    // 型ガードを使用してエラーメッセージを取得
    let errorMessage = '不明なエラー';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // エラーページにリダイレクト
    res.redirect(
      `${FRONTEND_URL}/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
});

// ★ログアウト--------------------------------------------------------------------------------------------------------------------------------------------
// ログアウトAPIエンドポイント
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
 console.log('ログアウト：リフレッシュトークンの削除')
  try {
    // ログアウト処理を実行
    await logout(refreshToken);

    // httpOnly クッキーをクリア
    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('ログアウト処理中にエラーが発生しました:', error);
    res.status(500).json({ message: 'ログアウトに失敗しました' });
  }
});

// ★保存--------------------------------------------------------------------------------------------------------------------------------------------
// ユーザーデータ保存APIエンドポイント
router.post('/user-save', async (req, res) => {
  try {
    const { user_id, user_name, user_icon, delete_iconurl } = req.body;

    // saveUser メソッドを呼び出してユーザーデータを保存
    const token = await saveUser(user_id, user_name, user_icon);

    // 旧R2データを削除
    if (delete_iconurl) {
      const old_object_Key = delete_iconurl.replace(
        `${process.env.CDN_DOMAIN}`,
        ''
      );
      deleteFromR2(old_object_Key);
    }

    // 成功レスポンスを返す
    res.status(200).json({
      message: 'ユーザーデータ保存成功',
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: 'ユーザーデータ保存に失敗しました',
      error: (error as Error).message,
    });
  }
});

// ★トークン--------------------------------------------------------------------------------------------------------------------------------------------
/**
 * API: アクセストークンの再発行
 * @param refreshToken - リフレッシュトークン
 * @returns 新しいアクセストークンとリフレッシュトークン
 */
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log('Received refreshToken:', req.cookies.refreshToken);

    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: 'リフレッシュトークンが提供されていません' });
    }

    // アクセストークンとリフレッシュトークンを再発行
    const { accessToken, refreshToken: newRefreshToken } =
      await authTokenService.refreshAccessToken(refreshToken);

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('アクセストークンの再発行に失敗しました:', error);

    // 型ガードを使用して Error 型であることを確認
    if (error instanceof Error) {
      if (error.message === '無効なリフレッシュトークンです') {
        return res
          .status(401)
          .json({ error: '無効なリフレッシュトークンです' });
      }
    }

    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router;
