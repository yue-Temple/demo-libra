import { useRouter } from 'vue-router';
import { Features, menu_name } from '@sharetypes'; // 型定義
import { useUserStore } from '@/stores/userStore'; // ストアをインポート
import { useHistoryStore } from '@/stores/historyStore';
import { useProfileStore } from '@/stores/profileStore';

export const goToMainPage = async (
  router: ReturnType<typeof useRouter>,
  routeuserNumber: any
) => {
  const userStore = useUserStore(); // ストアのインスタンスを取得
  const profileStore = useProfileStore();
  const historyStore = useHistoryStore();

  // 現在のユーザーナンバーをストアから取得
  const userNumber = Number(userStore.useuserNumber);

  if (userNumber) {
    try {
      // 他人ページORコンフィグから遷移時、初期化
      if (Number(routeuserNumber) != userNumber || routeuserNumber == null) {
        userStore.menuFetched = false;
        profileStore.profileBlocksFetched = false;
        historyStore.reset();
      }

      //メニュー設定をストアから取得
      await userStore.fetchFeatures(userNumber);

      // ストアからメニューデータを取得
      const menuSettings: Features[] = userStore.features;

      // メインページ（value の10の位が 1 の機能）を探す
      const mainPage = menuSettings.find((feature) => {
        const tensPlace = Math.floor((feature.value % 100) / 10); // 10の位を取得
        return tensPlace === 1; // 10の位が1かどうかをチェック
      });

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
  } else {
    const confirmLogin = confirm(
      'ログインしていません。ログイン画面に遷移しますか？'
    );
    if (confirmLogin) {
      router.push('/sign-in');
    }
  }
};
