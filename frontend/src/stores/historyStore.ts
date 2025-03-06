// stores/HistoryStore.ts
import { defineStore } from 'pinia';
import { useUserStore } from './userStore';
import { HistoryContainer, InfoBlock } from '@sharetypes';
import { convertFileToUrl } from '@/rogics/imageOfBlock';
import { apiClient } from './apiClient';
import { convertToURL } from '@/rogics/imageProcess';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const useHistoryStore = defineStore('history', {
  state: () => ({
    histories: [] as HistoryContainer[], // 取得した記録データ
    historyfetched: false, // ヒストリデータ取得済かのフラグ
    currentPage: 1, // 現在のページ番号
    isLoading: false, // データ取得中のローディング状態
    hasMore: true, // 次のページがあるかどうか
    scrollPosition: 0,
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
          newHistory.imgURL = result.cdnUrl;
        }

        await apiClient.post(`${apiBaseUrl}/hist/addhistories/${userNumber}`, {
          newHistory,
        });

        // ストア更新
        this.histories.unshift(newHistory);
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
      uploadFile: File | null,
      old_imageURL: string
    ): Promise<void> {
      const userNumber = getuseUserNumber();
      let old_image_url = null;

      try {
        // 画像データが存在すれば、URL化処理
        if (uploadFile != null) {
          const result = await convertToURL(uploadFile, userNumber, 'history');
          updateHistoryContent.imgURL = result.cdnUrl;
          old_image_url = old_imageURL; // 画像データがある時のみ破棄データが発生する
        }

        const index = this.histories.findIndex(
          (h) => h.id === updateHistoryContent.id
        );
        if (index !== -1) {
          this.histories[index] = updateHistoryContent;
        }

        await apiClient.put(
          `${apiBaseUrl}/hist/updatehistories/${userNumber}`,
          {
            updateHistoryContent: updateHistoryContent,
            image_url: old_image_url,
          }
        );
      } catch (error) {
        console.error('記録の更新に失敗しました', error);
        throw error;
      }
    },

    /**
     * API:ヒストリプロフィールを保存
     * @param historyId
     * @param newblocks
     * @param deleteblocks - 削除されたブロック
     * @param old_image_urls - 上書きで発生した古い画像のURL
     * @returns
     */
    async savehistProfile(
      historyId: string,
      newblocks: InfoBlock[],
      deleteblocks: InfoBlock[],
      old_image_urls: string[]
    ): Promise<InfoBlock[]> {
      const userNumber = getuseUserNumber();
      const kind = 'historyprofile';

      try {
        // addblocks配列を検証、画像をURLに差し替える処理を加える
        const processedAddBlocks = await convertFileToUrl(
          newblocks,
          userNumber,
          kind
        );

        // APIに送信
        await apiClient.put(
          `${apiBaseUrl}/hist/historyprofile/${userNumber}/${historyId}`,
          {
            newblocks: processedAddBlocks,
            deleteblocks: deleteblocks,
            old_image_urls: old_image_urls,
          }
        );

        console.log('プロフィールの保存に成功しました');
        return processedAddBlocks;
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
     * @param serchdate
     * @param serchtitle
     * @returns
     */
    async fetchHistories(
      userNumber: number,
      sortBy: string = 'date', // デフォルトの並び替え条件
      sortOrder: 'ASC' | 'DESC' = 'DESC', // デフォルトの並び替え順序
      serchdate: string | null,
      serchtitle: string | null
    ) {
      if (this.historyfetched) {
        return;
      }
      if (!this.hasMore || this.isLoading) return;
      this.isLoading = true;

      const userStore = useUserStore();
      if (!userStore.menuFetched) return;

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
            serchdate,
            serchtitle,
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
     *  API:記録を削除
     * @param historyId
     * @param delete_imageURL
     */
    async deleteHistory(historyId: string, delete_imageURL: string) {
      const userNumber = getuseUserNumber();
      try {
        // フロントエンドの状態から記録を削除
        this.histories = this.histories.filter(
          (history) => history.id !== historyId
        );

        // DBからデータを削除
        await apiClient.delete(
          `${apiBaseUrl}/hist/histories/${userNumber}/${historyId}`,
          {
            data: { delete_imageURL },
          }
        );
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

    // スクロール位置を保存
    saveScrollPosition(position: number) {
      this.scrollPosition = position;
    },
    // スクロール位置を取得
    getScrollPosition(): number {
      return this.scrollPosition;
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
