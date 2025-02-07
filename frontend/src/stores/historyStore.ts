// stores/HistoryStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { useUserStore } from './userStore';
import { HistoryContainer, InfoBlock } from '@sharetypes';
import { filetoURL, processInfoBlocks } from '@/rogics/fileupload';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useHistoryStore = defineStore('history', {
  state: () => ({
    histories: [] as HistoryContainer[], // 取得した記録データ
    currentPage: 1, // 現在のページ番号
    isLoading: false, // データ取得中のローディング状態
    hasMore: true, // 次のページがあるかどうか
  }),
  actions: {
    /**
     * API:記録を追加
     * @param newHistory
     */
    async addHistory(newHistory: HistoryContainer) {
      const userNumber = getuseUserNumber();
      try {
        // 画像データがFILEもしくはBase64形式の場合、URL化処理
        if (newHistory.imgURL != null) {
          if (
            newHistory.imgURL instanceof File ||
            newHistory.imgURL.startsWith('data:image/')
          ) {
            newHistory.imgURL = filetoURL(newHistory.imgURL);
          }
        }

        // ストア更新
        this.histories.push(newHistory);

        await axios.post(`${apiBaseUrl}/hist/histories`, {
          user_number: userNumber,
          newHistory,
        });
      } catch (error) {
        console.error('卓歴の追加に失敗しました', error);
        this.histories = this.histories.filter(
          (history) => history.id !== newHistory.id
        );
        throw error;
      }
    },

    /**
     * API: 卓歴を取得 ※利用者以外も利用
     * @param userNumber
     * @param sortBy 並び替え条件（例: 'id', 'date'）
     * @param sortOrder 並び替え順序（'ASC' または 'DESC'）
     * @returns
     */
    async fetchHistories(
      userNumber: number,
      sortBy: string = 'date', // デフォルトの並び替え条件
      sortOrder: 'ASC' | 'DESC' = 'ASC' // デフォルトの並び替え順序
    ) {
      if (!this.hasMore || this.isLoading) return;
      this.isLoading = true;

      try {
        const response = await axios.get<{
          data: HistoryContainer[];
          hasNext: boolean;
        }>(`${apiBaseUrl}/hist/histories/${userNumber}`, {
          params: {
            page: this.currentPage,
            limit: 20, // 1ページあたりの項目数
            sortBy, // 並び替え条件
            sortOrder, // 並び替え順序
          },
        });

        // ◆後で消す
        console.log('API Response:', {
          page: this.currentPage,
          received: response.data.data.length,
          hasNext: response.data.hasNext,
        });

        if (response.data.data.length > 0) {
          this.histories = [...this.histories, ...response.data.data];
          this.currentPage++;
        }
        this.hasMore = response.data.hasNext;
      } catch (error) {
        console.error('履歴の取得に失敗しました', error);
      } finally {
        this.isLoading = false;
      }
    },

    // ストアの状態リセット用メソッド
    reset() {
      this.histories = [];
      this.currentPage = 1;
      this.hasMore = true;
      this.isLoading = false;
    },

    /**
     * API:記録を更新
     * @param updateHistory
     */
    async updateHistory(updateHistory: HistoryContainer): Promise<void> {
      const userNumber = getuseUserNumber();

      try {
        // 画像データがFILEもしくはBase64形式の場合、URL化処理
        if (updateHistory.imgURL != null) {
          if (
            updateHistory.imgURL instanceof File ||
            updateHistory.imgURL.startsWith('data:image/')
          ) {
            updateHistory.imgURL = filetoURL(updateHistory.imgURL);
          }
        }

        const index = this.histories.findIndex(
          (h) => h.id === updateHistory.id
        );
        if (index !== -1) {
          this.histories[index] = updateHistory;
        }

        await axios.put(`${apiBaseUrl}/hist/histories/${userNumber}`, {
          updateHistory,
        });
      } catch (error) {
        console.error('卓歴の更新に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:ヒストリープロフィールブロックを保存
     * @param blocks
     * @param historyId
     */
    async savehistProfile(
      blocks: InfoBlock[],
      historyId: string
    ): Promise<void> {
      const userNumber = getuseUserNumber();

      try {
        // InfoBlock[] を処理
        const processedBlocks = await processInfoBlocks(blocks);

        // APIに送信
        await axios.post(`${apiBaseUrl}/hist/savehistprofile`, {
          userNumber,
          blocks: processedBlocks,
        });

        // 保存が成功したら、state.histories.childblockを更新
        //this.histories.childblock = processedBlocks;

        console.log('プロフィールの保存に成功しました');
      } catch (error) {
        console.error('プロフィールの保存に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:記録を削除
     * @param historyId
     */
    async deleteHistory(historyId: string) {
      const userNumber = getuseUserNumber();

      try {
        this.histories = this.histories.filter(
          (history) => history.id !== historyId
        );

        await axios.delete(
          `${apiBaseUrl}/hist/histories/${userNumber}/${historyId}`
        );
      } catch (error) {
        console.error('卓歴の削除に失敗しました', error);
        throw error;
      }
    },
  },
  getters: {
    getHistories: (state) => state.histories,
  },
});

// userNumber を取得するヘルパー関数
function getuseUserNumber(): number {
  const userStore = useUserStore();
  const userNumber = userStore.useuserNumber;

  if (!userNumber) {
    throw new Error('ユーザーエラー: userNumberが取得できません');
  }

  return Number(userNumber);
}
