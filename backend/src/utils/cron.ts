import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source'; // TypeORMのデータソース
import { RefreshToken } from '../entity/RefreshToken';

// 2か月に1回、毎月1日の午前3時に実行
cron.schedule('0 3 1 */2 *', async () => {  
  console.log('[Cron] Deleting expired refresh tokens...');
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  const result = await refreshTokenRepository.delete({
    expires_at: LessThan(new Date()),
  });

  console.log(`[Cron] Deleted ${result.affected} expired tokens.`);
});

console.log(
  'Cron job for deleting expired tokens is set (Runs on 1st day of each month).'
);
