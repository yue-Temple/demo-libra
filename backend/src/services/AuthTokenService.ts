import { AppDataSource } from '../data-source';
import jwt from 'jsonwebtoken';
// エンティティ
import { RefreshToken } from '../entity/RefreshToken';
import { Repository } from 'typeorm';

const tokenExpiry = '3h'; // アクセストークンの期限
const refreshExpiry = '180d'; // リフレッシュトークンの期限
const secretKey = process.env.JWT_SECRET_KEY!;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET!;

export class AuthTokenService {
  /**
   * API: アクセストークンの再発行
   * @param refreshToken - リフレッシュトークン
   * @returns 新しいアクセストークンとリフレッシュトークン
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // リフレッシュトークンを検証
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const existingToken = await refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['user'],
      });

      if (
        !existingToken ||
        existingToken.is_revoked ||
        existingToken.expires_at < new Date()
      ) {
        throw new Error('無効なリフレッシュトークンです');
      }

      // リフレッシュトークンの有効期限を確認
      const remainingDays =
        (existingToken.expires_at.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24);

      let newRefreshToken = refreshToken; // 初期値として古いリフレッシュトークンを設定
      if (remainingDays <= 90) {
        // リフレッシュトークンを更新（ローテーション: 90日以下になった場合のみ）
        newRefreshToken = await this.rotateRefreshToken(
          existingToken,
          refreshTokenRepository
        );
      }

      // 新しいアクセストークンを生成
      const newAccessToken = jwt.sign(
        {
          user_id: existingToken.user.user_id,
          user_name: existingToken.user.user_name,
          user_number: existingToken.user.user_number,
          user_icon: existingToken.user.user_icon,
          user_role: existingToken.user.user_role,
          user_email: existingToken.user.user_email,
          user_googleid: existingToken.user.google_user_id,
        },
        secretKey,
        { expiresIn: tokenExpiry }
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('アクセストークンの再発行に失敗しました:', error);
      throw error;
    }
  }

  /**
   * リフレッシュトークンのローテーション
   * @param existingToken - 現在のリフレッシュトークン
   * @param refreshTokenRepository - リフレッシュトークンリポジトリ
   * @returns 新しいリフレッシュトークン
   */
  private async rotateRefreshToken(
    existingToken: RefreshToken,
    refreshTokenRepository: Repository<RefreshToken>
  ): Promise<string> {
    // 古いリフレッシュトークンを無効化
    existingToken.is_revoked = true;
    await refreshTokenRepository.save(existingToken);

    // 新しいリフレッシュトークンを生成
    const newRefreshToken = jwt.sign(
      { user_id: existingToken.user.user_id },
      refreshSecretKey,
      { expiresIn: '180d' }
    );

    // 新しいリフレッシュトークンを保存
    await refreshTokenRepository.save({
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
      user: existingToken.user,
    });

    return newRefreshToken;
  }
}

/**
 * アクセストークンを生成する関数
 * @param user ユーザー情報
 * @returns 生成されたアクセストークン
 */
export function generateAccessToken(user: {
  user_id: string;
  user_number: number;
  user_name: string | null;
  user_icon: string;
  user_role: string | null;
  user_email: string | null;
  google_user_id: string | null;
}): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      user_number: user.user_number,
      user_name: user.user_name,
      user_icon: user.user_icon,
      user_role: user.user_role,
      user_email: user.user_email,
      user_googleid: user.google_user_id,
    },
    secretKey,
    { expiresIn: tokenExpiry }
  );
}

/**
 * リフレッシュトークンを生成する関数
 * @param user_id ユーザーID
 * @returns 生成されたリフレッシュトークン
 */
export function generateRefreshToken(user_id: string): string {
  return jwt.sign({ user_id }, refreshSecretKey, { expiresIn: refreshExpiry });
}

/**
 * ログアウトAPI
 * @param refreshToken
 */
export async function logout(refreshToken: string): Promise<void> {
  if (!refreshToken) {
    throw new Error('リフレッシュトークンがありません');
  }

  try {
    // データベースからリフレッシュトークンを削除
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const result = await refreshTokenRepository.delete({ token: refreshToken });

    if (result.affected === 0) {
      throw new Error('リフレッシュトークンが見つかりませんでした');
    }

    console.log('ログアウトしました');
  } catch (error) {
    console.error('ログアウト中にエラーが発生しました:', error);
    throw error; // 呼び出し元にエラーを伝播
  }
}
