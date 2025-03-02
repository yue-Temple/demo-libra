import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source'; // TypeORMのデータソース
import { RefreshToken } from '../entity/RefreshToken';
import { UserTemporary } from '../entity/UserTemporary';
import { UserPasswordReset } from '../entity/UserPasswordReset'; 

// リフレッシュトークンの削除ジョブ (2か月に1回、毎月1日の午前3時に実行)
cron.schedule('0 3 1 */2 *', async () => {
  console.log('[Cron] Deleting expired refresh tokens...');
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  const result = await refreshTokenRepository.delete({
    expires_at: LessThan(new Date()),
  });
  console.log(`[Cron] Deleted ${result.affected} expired refresh tokens.`);
});

// 仮登録レコードの削除ジョブ (毎日午前4時に実行)
cron.schedule('0 4 * * *', async () => {
  console.log('[Cron] Deleting expired temporary users...');
  const temporaryUserRepository = AppDataSource.getRepository(UserTemporary);
  const result = await temporaryUserRepository.delete({
    expires_at: LessThan(new Date()),
  });
  console.log(`[Cron] Deleted ${result.affected} expired temporary users.`);
});

// パスワードリセット用トークンの削除ジョブ (毎日午前5時に実行)
cron.schedule('0 5 * * *', async () => {
  console.log('[Cron] Deleting expired password reset tokens...');
  const passwordResetRepository = AppDataSource.getRepository(UserPasswordReset);
  const result = await passwordResetRepository.delete({
    expires_at: LessThan(new Date()),
  });
  console.log(`[Cron] Deleted ${result.affected} expired password reset tokens.`);
});

console.log(
  'Cron jobs are set:\n' +
    '- Refresh token cleanup: Runs on the 1st day of every 2 months at 3 AM.\n' +
    '- Temporary user cleanup: Runs daily at 4 AM.\n' +
    '- Password reset token cleanup: Runs daily at 5 AM.'
);