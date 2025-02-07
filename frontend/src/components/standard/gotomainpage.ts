import { useRouter } from 'vue-router';
import { Features, menu_name } from '@sharetypes'; // 型定義
import { useUserStore } from '@/stores/userStore'; // ストアをインポート

export const goToMainPage = async (router: ReturnType<typeof useRouter>) => {
  const userStore = useUserStore(); // ストアのインスタンスを取得

  // 現在のユーザーナンバーをストアから取得
  const userNumber = Number(userStore.useuserNumber);

  if (userNumber) {
    try {
      // メニュー設定をストアのアクションを使って取得
      await userStore.fetchFeatures(userNumber);

      // ストアからメニューデータを取得
      const menuSettings: Features[] = userStore.features;

      // メインページ（value が 1 の機能）を探す
      const mainPage = menuSettings.find((feature) => feature.value === 1);
      if (!mainPage) {
        return;
      }

      // メインページに遷移 ※配列＝名前配列
      switch (mainPage.name) {
        case menu_name[0]:
          router.push(`/${userNumber}/profile`);
          break;
        case menu_name[1]:
          router.push(`/${userNumber}/history`);
          break;
        case menu_name[2]:
          router.push(`/${userNumber}/chara`);
          break;
        case menu_name[3]:
          router.push(`/${userNumber}/data`);
          break;
        case menu_name[4]:
          router.push(`/${userNumber}/relation`);
          break;
        default:
          console.error('メインページが設定されていません');
      }
    } catch (error) {
      console.error('メニュー設定の取得に失敗しました', error);
    }
  }
};
