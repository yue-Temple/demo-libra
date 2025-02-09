// stores/HistoryStore.ts
import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { HistoryContainer, InfoBlock } from '@sharetypes';
import { processInfoBlocks } from '@/rogics/imageOfBlock';
import { apiClient } from './apiClient';
import { convertToURL, deleteFromR2 } from '@/rogics/imageProcess';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useHistoryStore = defineStore('history', {
  state: () => ({
    histories: [] as HistoryContainer[], // 取得した記録データ
    historyfetched: false, // ヒストリデータ取得済かのフラグ
    currentPage: 1, // 現在のページ番号
    isLoading: false, // データ取得中のローディング状態
    hasMore: true, // 次のページがあるかどうか
  }),
  actions: {
    /**
     *  API:記録を新規追加
     * @param newHistory
     * @param uploadFile
     */
    async addHistory(newHistory: HistoryContainer, uploadFile: File | null) {
      const userNumber = getuseUserNumber();
      try {
        // 画像データが存在すれば、URL化処理
        if (uploadFile != null) {
          const result = await convertToURL(uploadFile, userNumber, 'history');
          newHistory.image_object_key = result.objectKey;
          newHistory.imgURL = result.cdnUrl;
        }

        // ストア更新
        this.histories.push(newHistory);

        await apiClient.post(`${apiBaseUrl}/hist/histories`, {
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
     * API:記録を更新
     * @param updateHistoryContent
     */
    async updateHistory(
      updateHistoryContent: HistoryContainer,
      uploadFile: File | null
    ): Promise<void> {
      const userNumber = getuseUserNumber();

      try {
        // 画像データが存在すれば、URL化処理
        if (uploadFile != null) {
          const result = await convertToURL(uploadFile, userNumber, 'history');
          updateHistoryContent.image_object_key = result.objectKey;
          updateHistoryContent.imgURL = result.cdnUrl;
        }

        const index = this.histories.findIndex(
          (h) => h.id === updateHistoryContent.id
        );
        if (index !== -1) {
          this.histories[index] = updateHistoryContent;
        }

        await apiClient.put(`${apiBaseUrl}/hist/histories/${userNumber}`, {
          updateHistoryContent,
        });
      } catch (error) {
        console.error('記録の更新に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:ヒストリプロフィールを更新
     * @param historyId
     * @param updateChildBlocks
     * @returns
     */
    async savehistProfile(
      historyId: string,
      updateChildBlocks: InfoBlock[]
    ): Promise<InfoBlock[]> {
      const userNumber = getuseUserNumber();

      try {
        // InfoBlock[] を処理(画像データをURLに変換)
        const processedChildeBlocks =
          await processInfoBlocks(updateChildBlocks);

        // APIに送信
        await apiClient.put(
          `${apiBaseUrl}/hist/historyprofile/${userNumber}/${historyId}`,
          {
            blocks: processedChildeBlocks,
          }
        );

        console.log('プロフィールの保存に成功しました');
        return processedChildeBlocks;
      } catch (error) {
        console.error('プロフィールの保存に失敗しました', error);
        throw error;
      }
    },

    /**
     * API: 記録を取得 ※利用者以外も利用
     * @param userNumber
     * @param sortBy 並び替え条件（例: 'id', 'date'）
     * @param sortOrder 並び替え順序（'ASC' または 'DESC'）
     * @returns
     */
    async fetchHistories(
      userNumber: number,
      sortBy: string = 'date', // デフォルトの並び替え条件
      sortOrder: 'ASC' | 'DESC' = 'DESC' // デフォルトの並び替え順序
    ) {
      if (!this.hasMore || this.isLoading) return;
      this.isLoading = true;

      try {
        const response = await apiClient.get<{
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
        // console.log('API Response:', {
        //   page: this.currentPage,
        //   received: response.data.data.length,
        //   hasNext: response.data.hasNext,
        // });

        if (response.data.data.length > 0) {
          this.histories = [...this.histories, ...response.data.data];
          this.currentPage++;
        }
        this.hasMore = response.data.hasNext;
      } catch (error) {
        console.error('記録の取得に失敗しました', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * API: 再読み込み時利用、記録詳細一件取得 ※利用者以外も利用
     * @param userNumber
     * @param historyId
     * @returns
     */
    async fetchHistoriesdetail(
      userNumber: number,
      historyId: string
    ): Promise<HistoryContainer | null> {
      try {
        const response = await apiClient.get<{ data: HistoryContainer }>(
          `${apiBaseUrl}/hist/historydetail/${userNumber}/${historyId}`
        );
        return response.data.data;
      } catch (error) {
        console.error('記録詳細の取得に失敗しました', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * API:記録を削除
     * @param historyId
     */
    async deleteHistory(historyId: string, image_object_key: string) {
      const userNumber = getuseUserNumber();
      try {
        // フロントエンドの状態から記録を削除
        this.histories = this.histories.filter(
          (history) => history.id !== historyId
        );

        // DBからデータを削除
        await apiClient.delete(
          `${apiBaseUrl}/hist/histories/${userNumber}/${historyId}`
        );

        // DBの削除が成功したら、R2から画像を削除
        await deleteFromR2(image_object_key);
      } catch (error) {
        console.error('記録の削除に失敗しました', error);
        throw error;
      }
    },

    // ストアの状態リセット用メソッド
    reset() {
      this.histories = [];
      this.currentPage = 1;
      this.hasMore = true;
      this.isLoading = false;
    },
  },
  getters: {
    getHistories: (state) => state.histories,
  },
});

/**
 * userNumber を取得するヘルパー関数
 * @returns
 */
function getuseUserNumber(): number {
  const userStore = useUserStore();
  const userNumber = userStore.useuserNumber;

  if (!userNumber) {
    throw new Error('ユーザーエラー: userNumberが取得できません');
  }

  return Number(userNumber);
}
