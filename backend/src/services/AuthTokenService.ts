import { AppDataSource } from '../data-source';
import jwt from 'jsonwebtoken';
// エンティティ
import { RefreshToken } from '../entity/RefreshToken';
import { Repository } from 'typeorm';

export class AuthTokenService {
  /**
   * API: アクセストークンの再発行
   * @param refreshToken - リフレッシュトークン
   * @returns 新しいアクセストークンとリフレッシュトークン
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const secretKey = process.env.JWT_SECRET_KEY!;
    const tokenExpiry = '3h'; // アクセストークンの期限

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
      process.env.JWT_REFRESH_SECRET!,
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
