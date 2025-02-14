import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();

// メニューバーが無い画面で再読み込みした際、メニュー情報とレイアウトを取得する関数
export const fetchLayoutifNomenu = async (usernumber: string) => {
  const userNumber = Number(usernumber);

  if (!userNumber) {
    console.error('User number is missing from route');
    return;
  }

  try {
    // ストアからメニュー情報を取得
    await userStore.fetchFeatures(userNumber);
  } catch (error) {
    console.error('メニュー設定の取得に失敗しました', error);
  }
};
