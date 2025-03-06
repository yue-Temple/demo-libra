import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { InfoBlock } from '@sharetypes';
import { formatInfoBlock } from '@/rogics/infoblockformat';
import { convertFileToUrl } from '@/rogics/imageOfBlock';
import { apiClient } from './apiClient';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profileBlocks: [] as InfoBlock[],
    profileBlocksFetched: false, // キャッシュ用のフラグ
  }),
  actions: {
    // API:プロフィールブロックを取得 ※利用者以外も利用
    async fetchProfileBlocks(userNumber: number) {
      // 既に取得済みの場合は早期リターン
      if (this.profileBlocksFetched) {
        return;
      }

      // const userStore = useUserStore();
      // console.log(userStore.menuFetched)
      // if(userStore.menuFetched) {return};

      try {
        const response = await apiClient.get<InfoBlock[]>(
          `${apiBaseUrl}/prof/profiles/${userNumber}/blocks`
        );

        // 取得したデータを整形
        this.profileBlocks = response.data.map(formatInfoBlock);

        // 取得済みフラグを更新
        this.profileBlocksFetched = true;
      } catch (error) {
        console.error('プロフィールブロックの取得に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:プロフィールブロックを保存
     * @param blocks
     * @param addblocks
     * @param deleteblocks
     */
    async saveProfile(
      newblocks: InfoBlock[],
      deleteblocks: InfoBlock[],
      old_image_urls: string[]
    ): Promise<void> {
      const userNumber = getuseUserNumber();
      const kind = 'profile';
      try {
        // newblocks配列を検証、画像をURLに差し替える処理を加える
        const processedAddBlocks = await convertFileToUrl(
          newblocks,
          userNumber,
          kind
        );

        // APIに送信
        await apiClient.post(`${apiBaseUrl}/prof/saveprofile`, {
          userNumber,
          newblocks: processedAddBlocks,
          deleteblocks: deleteblocks,
          old_image_urls: old_image_urls,
        });

        // 保存が成功したら、state.profileBlocksを更新
        this.profileBlocks = processedAddBlocks;

        console.log('プロフィールの保存に成功しました');
      } catch (error) {
        console.error('プロフィールの保存に失敗しました', error);
        throw error;
      }
    },
  },
  getters: {
    getProfileBlocks: (state) => state.profileBlocks,
  },
});

// userNumber を取得するヘルパー関数
function getuseUserNumber(): number {
  const userStore = useUserStore();
  const userNumber = Number(userStore.useuserNumber);

  if (!userNumber) {
    throw new Error('ユーザーエラー: userNumberが取得できません');
  }

  return userNumber;
}
