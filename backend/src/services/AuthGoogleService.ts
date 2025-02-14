import { AppDataSource } from '../data-source';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Response } from 'express';
// エンティティ
import { User } from '../entity/User';
import { Menu } from '../entity/Menu';
import { RefreshToken } from '../entity/RefreshToken';
// 型定義
import { Role } from '../backtype';
// 関数
import { generateRandomUserId } from '../utils/uuid';
import { generateAccessToken, generateRefreshToken } from './AuthTokenService';
import { AuthTokenService } from './AuthTokenService';

const tokenService = new AuthTokenService();

export class AuthGoogleService {
  /**
   * API: Google アカウントでの登録
   * @param authCode - 認可コード
   * @param deviceId - デバイスID
   * @param res 
   * @returns { accessToken }
   */
  async registerWithGoogle(
    authCode: string,
    deviceId: string,
    res: Response
  ): Promise<{ accessToken: string }> {
    try {
      // 環境変数の検証
      const requiredEnvVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'REGISTER_REDIRECT_URI',
        'JWT_SECRET_KEY',
        'JWT_REFRESH_SECRET',
      ];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`環境変数 ${envVar} が設定されていません`);
        }
      }

      // 認可コードを使用してGoogleからトークンを取得
      const isLogin = false;
      const { id_token } = await this.fetchGoogleTokens(authCode, isLogin);

      // IDトークンを検証
      const googlePayload = await this.verifyGoogleToken(id_token);
      const googleUserId = googlePayload.sub;

      // ユーザーの存在確認
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({
        where: { google_user_id: googleUserId },
      });
      if (existingUser) {
        throw new Error('この Google アカウントは既に登録されています');
      }

      const userId = generateRandomUserId();
      // 新しいユーザーを作成
      const newUser = new User();
      newUser.user_id = userId;
      newUser.user_role = Role.NormalUser;
      newUser.google_user_id = googleUserId;
      await userRepository.save(newUser);

      // メニューテーブルの生成
      const menuRepository = AppDataSource.getRepository(Menu);
      const newMenu = new Menu();
      newMenu.user_number = newUser.user_number;
      await menuRepository.save(newMenu);

      // JWT トークンを生成
      const accessToken = generateAccessToken(newUser);

      // リフレッシュトークンを生成
      const refreshToken = generateRefreshToken(newUser.user_id);

      // リフレッシュトークンをデータベースに保存（デバイスIDを含む）
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      await refreshTokenRepository.save({
        token: refreshToken,
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
        user: newUser, // リレーションを設定
        device_id: deviceId, // デバイスIDを保存
      });

      // リフレッシュトークンをクッキーに保存
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // JavaScriptからアクセス不可
        secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none', // 開発環境ではクロスサイトを許可
        path: '/', // すべてのパスで有効
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
      });

      return { accessToken }; 

    } catch (error) {
      console.error('Google 登録に失敗しました:', error);
      throw error;
    }
  }


  /**
   * API: Google アカウントでのログイン
   * @param authCode - 認可コード
   * @param deviceId - デバイスID
   * @param res 
   * @returns { accessToken }
   */
  async loginWithGoogle(
    authCode: string,
    deviceId: string,
    res: Response // レスポンスオブジェクトを引数に追加
  ): Promise<{ accessToken: string }> { // レスポンスからrefreshTokenを削除
    try {
      // 環境変数の検証
      const requiredEnvVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'LOGIN_REDIRECT_URI',
        'JWT_SECRET_KEY',
        'JWT_REFRESH_SECRET',
      ];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`環境変数 ${envVar} が設定されていません`);
        }
      }
  
      // 認可コードを使用してGoogleからトークンを取得
      const isLogin = true;
      const { id_token } = await this.fetchGoogleTokens(authCode, isLogin);
  
      // IDトークンを検証
      const googlePayload = await this.verifyGoogleToken(id_token);
      const googleUserId = googlePayload.sub;
  
      
      const userRepository = AppDataSource.getRepository(User);
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      // ユーザーを検索
      const existingUser = await userRepository.findOne({
        where: { google_user_id: googleUserId },
      });
      if (!existingUser) {
        throw new Error('この Google アカウントは登録されていません');
      }
  
      // 既存のリフレッシュトークンを確認
      const existingToken = await refreshTokenRepository.findOne({
        where: { user: { user_id: existingUser.user_id }, device_id: deviceId },
      });
  
      // 1⃣リフレッシュトークンがない場合
      if (!existingToken) {
        console.log('ログイン：リフレッシュトークンを作成');
        const accessToken = generateAccessToken(existingUser); // アクセストークンを生成
        const refreshToken = generateRefreshToken(existingUser.user_id); // リフレッシュトークンを生成
  
        // 新しいリフレッシュトークンをデータベースに保存
        const newRefreshToken = refreshTokenRepository.create({
          token: refreshToken,
          expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
          user: existingUser,
          device_id: deviceId,
        });
        await refreshTokenRepository.save(newRefreshToken);
  
        // リフレッシュトークンをクッキーに保存
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true, // JavaScriptからアクセス不可
          secure: true,
          sameSite: 'lax',
          path: '/', // すべてのパスで有効
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
        });
  
        return { accessToken }; 
      }
  
      // 2⃣リフレッシュトークンがある場合　※たぶんいらない（ログアウト時リフレッシュトークン削除する為）
      if (existingToken) {
        // リフレッシュトークンを渡してアクセストークンを再発行
        const { accessToken, refreshToken } =
          await tokenService.refreshAccessToken(existingToken.token); //期限検証,必要に応じて更新
  
        // 新しいリフレッシュトークンをクッキーに保存
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30日間有効
        });
  
        return { accessToken }; 
      }
  
      // ここには到達しないが、型チェックのためにデフォルトの戻り値を設定
      throw new Error('予期せぬエラーが発生しました');
    } catch (error) {
      console.error('Google ログインに失敗しました:', error);
      throw error;
    }
  }

  /**
   * Google OAuth 2.0 エンドポイントからトークンを取得
   * @param authCode - 認可コード
   * @param isLogin
   * @returns { id_token, access_token, refresh_token } - 取得したトークン情報
   */
  private async fetchGoogleTokens(
    authCode: string,
    isLogin: boolean
  ): Promise<{
    id_token: string;
    access_token: string;
    refresh_token?: string;
  }> {
    let params;

    if (isLogin) {
      // ログインの場合
      const requiredEnvVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'LOGIN_REDIRECT_URI', // ログイン
      ];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`環境変数 ${envVar} が設定されていません`);
        }
      }
      // リクエストパラメータの構築
      params = new URLSearchParams({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.LOGIN_REDIRECT_URI!,
        grant_type: 'authorization_code',
      });
    } else {
      // 登録の場合
      const requiredEnvVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'REGISTER_REDIRECT_URI', // 登録
      ];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          throw new Error(`環境変数 ${envVar} が設定されていません`);
        }
      }
      // リクエストパラメータの構築
      params = new URLSearchParams({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.REGISTER_REDIRECT_URI!,
        grant_type: 'authorization_code',
      });
    }

    try {
      // Google OAuth 2.0 エンドポイントにPOSTリクエストを送信
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // 応答データから必要なトークン情報を抽出
      const { id_token, access_token, refresh_token } = tokenResponse.data;

      // 必要なトークンが含まれているか確認
      if (!id_token || !access_token) {
        throw new Error('必要なトークンが取得できませんでした');
      }

      return { id_token, access_token, refresh_token };
    } catch (error) {
      console.error('Google トークンの取得に失敗しました:', error);
      throw new Error('Google トークンの取得に失敗しました');
    }
  }

  /**
   * Google ID トークンを検証
   * @param idToken - Google ID トークン
   * @returns 検証済みのペイロード
   */
  private async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      // JWKS クライアントを初期化
      const client = jwksClient({
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      });

      // JWT をデコードしてヘッダーから kid を取得
      const decodedHeader = jwt.decode(idToken, { complete: true })?.header;
      if (!decodedHeader || !decodedHeader.kid) {
        throw new Error('無効な JWT ヘッダーです');
      }

      // kid に対応する公開鍵を取得
      const key = await new Promise<string>((resolve, reject) => {
        client.getSigningKey(
          decodedHeader.kid,
          (
            err: Error | null,
            key: { getPublicKey: () => string } | undefined
          ) => {
            if (err) {
              reject(err);
            } else if (!key) {
              reject(new Error('公開鍵が見つかりませんでした'));
            } else {
              resolve(key.getPublicKey());
            }
          }
        );
      });

      // JWT を検証
      const verifiedPayload = jwt.verify(idToken, key, {
        algorithms: ['RS256'], // RS256 アルゴリズムを使用
        issuer: ['https://accounts.google.com', 'accounts.google.com'], // 発行者が Google であることを確認
        audience: process.env.GOOGLE_CLIENT_ID, // 自分のクライアントIDと一致することを確認
        clockTolerance: 5, // 時刻ずれ許容秒数
      });

      return verifiedPayload;
    } catch (error) {
      console.error('Google ID トークンの検証に失敗しました:', error);
      throw new Error('無効な Google ID トークンです');
    }
  }
}
