// src/routes/auth.ts
import express from 'express';
import { Request, Response } from 'express';
import { AuthMailService } from '../services/AuthMailService';
import { AuthGoogleService } from '../services/AuthGoogleService';
import { AuthTokenService, logout } from '../services/AuthTokenService';
import { deleteFromR2 } from '../services/R2Service';
import { saveUser } from '../services/AuthUserService';
import { AuthPassResetService } from '../services/AuthPassResetService';
import { deleteUseraccount } from '../services/UserService';
import { authenticateToken } from '../middleware/authMiddleware';

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
// メールアドレスによる仮登録APIエンドポイント
router.post('/register-with-email', async (req, res) => {
  try {
    const { email } = req.body;

    // 仮登録処理
    await mailService.registerWithEmail(email);

    // 成功レスポンスを返す
    res.status(200).json({
      message: '仮登録が完了しました。認証コードを確認してください。',
    });
  } catch (error) {
    if (
      (error as Error).message === 'このメールアドレスは既に登録されています'
    ) {
      res.status(409).json({ error: (error as Error).message }); // 409 Conflict
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' }); // 一般的なエラー処理
    }
  }
});

// 認証コード検証＋本登録APIエンドポイント
router.post('/verify-and-complete-registration', async (req, res) => {
  try {
    const { email, code, password, deviceId } = req.body;

    // 認証コード検証と本登録処理
    const tokens = await mailService.verifyAndCompleteRegistration(
      email,
      password,
      code,
      deviceId,
      res
    );

    // 成功レスポンスを返す
    res.status(201).json({
      message: '本登録が完了しました。',
      accessToken: tokens.accessToken,
    });
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
    const { accessToken } = await googleService.registerWithGoogle(
      code,
      deviceId,
      res
    );

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
    const { email, password, deviceId } = req.body;
    const token = await mailService.loginWithEmail(
      email,
      password,
      deviceId,
      res
    ); // トークンを受け取る

    res.status(200).json({ message: 'メールログイン成功', token }); // トークンを含めて返す
  } catch (error) {
    res.status(422).json({
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
      res
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

// ★パスワードリセット--------------------------------------------------------------------------------------------------------------------------------------------
// パスワードリセットリクエスト、OTP発行
router.post('/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'メールアドレスは必須です。' });
    }

    await AuthPassResetService.ResetRequest(email);
    res.status(200).json({ message: 'OTPを送信しました。' });
  } catch (error) {
    console.error(
      'パスワードリセットリクエスト中にエラーが発生しました:',
      error
    );
    res.status(500).json({ message: (error as Error).message });
  }
});

// OTP認証
router.post('/password-reset/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ message: 'メールアドレスとOTPは必須です。' });
    }

    await AuthPassResetService.otpVerify(email, code);
    res.status(200).json({ message: 'OTPの認証に成功しました。' });
  } catch (error) {
    console.error('OTP認証中にエラーが発生しました:', error);
    res.status(500).json({ message: (error as Error).message });
  }
});

// パスワード再設定
router.post('/password-reset/set', async (req, res) => {
  try {
    const { email, newpassword } = req.body;
    if (!email || !newpassword) {
      return res
        .status(400)
        .json({ message: 'メールアドレスと新しいパスワードは必須です。' });
    }

    await AuthPassResetService.passwordSet(email, newpassword);
    res.status(200).json({ message: 'パスワードの更新に成功しました。' });
  } catch (error) {
    console.error('パスワード更新中にエラーが発生しました:', error);
    res.status(500).json({ message: (error as Error).message });
  }
});

// ★ログアウト--------------------------------------------------------------------------------------------------------------------------------------------
// ログアウトAPIエンドポイント
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('ログアウト：リフレッシュトークンの削除');
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
router.post(
  '/user-save',
  authenticateToken, // トークン検証ミドルウェア
  async (req, res) => {
    try {
      const { user_id, user_name, user_icon, delete_iconurl } = req.body;
      console.log(user_id, user_name, user_icon);

      // saveUser メソッドを呼び出してユーザーデータを保存
      const newtoken = await saveUser(user_id, user_name, user_icon);

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
        newtoken,
      });
    } catch (error) {
      res.status(500).json({
        message: 'ユーザーデータ保存に失敗しました',
        error: (error as Error).message,
      });
    }
  }
);

/**
 * ユーザーアカウント削除エンドポイント
 * @param req - リクエストオブジェクト
 * @param res - レスポンスオブジェクト
 */
router.delete(
  '/user-delete',
  authenticateToken, // トークン検証ミドルウェア
  async (req: Request, res: Response) => {
    try {
      // ミドルウェアで検証済みのユーザー ID を使用
      const user_id = req.body.user_id;

      // ユーザーアカウント削除関数を呼び出し
      await deleteUseraccount(user_id);
      // httpOnly クッキーをクリア
      res.clearCookie('refreshToken', { path: '/' });

      // 成功レスポンスを返す
      res.status(200).json({ message: 'アカウント削除が完了しました' });
    } catch (error) {
      console.error('アカウント削除中にエラーが発生しました:', error);

      // エラーレスポンスを返す
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: 'アカウント削除中に不明なエラーが発生しました' });
      }
    }
  }
);

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
