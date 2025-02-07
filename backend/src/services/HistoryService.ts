import { AppDataSource } from '../data-source';
import { History } from '../entity/History';
import { HistoryItem } from '../entity/HistoryItem';
import { HistoryContainer } from '../../../sharetypes';

export class HistoryService {
  private historyRepository = AppDataSource.getRepository(History);
  private historyItemRepository = AppDataSource.getRepository(HistoryItem);

  /**
   * 卓歴追加API
   * HistoryContainer 型のデータを受け取り、データベースの histories 配列に追加する
   * @param user_number - ユーザーの user_number
   * @param newHistory - 追加する HistoryContainer 型のデータ
   */
  async addHistory(
    user_number: number,
    newHistory: HistoryContainer
  ): Promise<void> {
    // ユーザーの履歴データを取得
    const history = await this.historyRepository.findOne({
      where: { user_number },
      relations: ['histories'],
    });

    // HistoryContainer を HistoryItem に変換
    const newItem = new HistoryItem(
      newHistory.id || null, // id が null の場合を考慮（nullになる）
      newHistory.date,
      newHistory.keydate,
      newHistory.title,
      newHistory.system,
      newHistory.report,
      newHistory.imgURL,
      newHistory.private,
      newHistory.childblock
    );

    if (!history) {
      // 履歴データが存在しない場合は新規作成
      const newHistoryRecord = new History(user_number);
      newHistoryRecord.histories = [newItem];
      await this.historyRepository.save(newHistoryRecord);
    } else {
      // 履歴データが存在する場合は配列に追加
      history.histories.push(newItem);

      // id の順番でソート
      history.histories.sort(
        (a, b) => parseInt(a.historyid) - parseInt(b.historyid)
      );

      console.log(history);
      // データベースを更新
      await this.historyRepository.save(history);
    }
  }

  /**
   * 卓歴更新API
   * データベースの histories 配列から、UserNumber と historyid が一致するデータを更新する
   * @param user_number - ユーザーの user_number
   * @param updateHistoryContent - 更新する HistoryContainer 型のデータ
   */
  async updateHistory(
    user_number: number,
    updateHistoryContent: HistoryContainer
  ): Promise<void> {
    try {
      // user_number に対応する History エンティティを取得
      const history = await this.historyRepository.findOne({
        where: { user_number },
        relations: ['histories'], // histories を含めて取得
      });

      if (!history) {
        throw new Error('History not found');
      }

      // histories 配列から該当する HistoryItem を探す
      const index = history.histories.findIndex(
        (h) => h.historyid === updateHistoryContent.id
      );

      if (index === -1) {
        throw new Error('History content not found');
      }

      // 該当する HistoryItem を更新
      history.histories[index] = {
        ...history.histories[index], // 既存のデータを保持
        ...updateHistoryContent, // 新しいデータで上書き
      };

      // データベースを更新
      await this.historyRepository.save(history);
    } catch (error) {
      console.error('Error updating history:', error);
      throw new Error('Failed to update history');
    }
  }

  /**
   * 卓歴削除API
   * データベースの histories 配列から、UserNumber と historyid が一致するデータを削除する
   * @param user_number - ユーザーの user_number
   * @param historyId - 削除する HistoryItem の historyid
   */
  async deleteHistory(user_number: number, historyId: string): Promise<void> {
    try {
      // user_number に対応する History エンティティを取得
      const history = await this.historyRepository.findOne({
        where: { user_number },
        relations: ['histories'], // histories を含めて取得
      });
      if (!history) {
        throw new Error('History not found');
      }

      // 該当する HistoryItem を探す
      const historyItem = history.histories.find(
        (h) => h.historyid === historyId
      );
      if (!historyItem) {
        throw new Error('History content not found');
      }

      // HistoryItem を削除
      await this.historyItemRepository.delete({ historyid: historyId });

      // History の histories 配列からも削除
      history.histories = history.histories.filter(
        (h) => h.historyid !== historyId
      );

      // History を保存（オプション）
      await this.historyRepository.save(history);
    } catch (error) {
      console.error('Error deleting history:', error);
      throw new Error('Failed to delete history');
    }
  }

  /**
   * ヒストリ取得API
   * @param user_number - ユーザー番号
   * @param page - 取得するページ番号（1から始まる）
   * @param limit - 1ページあたりの最大件数
   * @param sortBy - 並び替え条件（例: 'historyid', 'date'）
   * @param sortOrder - 昇順 ('ASC') または降順 ('DESC')
   * @returns 履歴データと次のページの有無
   */
  async getHistories(
    user_number: number,
    page: number,
    limit: number,
    sortBy: 'id' | 'date', // id または date のみを許可
    sortOrder: 'ASC' | 'DESC' // 昇順 or 降順
  ): Promise<{ data: HistoryContainer[]; hasNext: boolean }> {
    // user_number に合致する History エンティティを取得
    const history = await this.historyRepository.findOne({
      where: { user_number },
      relations: ['histories'], // histories 配列を含める
    });

    if (!history) {
      // 対応する履歴が存在しない場合
      return {
        data: [],
        hasNext: false,
      };
    }

    // histories 配列を取得
    let histories = history.histories;

    // 並び替え処理
    histories.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'id') {
        // sortBy が 'id' の場合、historyid を使用
        valueA = a.historyid;
        valueB = b.historyid;
      } else if (sortBy === 'date') {
        // sortBy が 'date' の場合、keydate を使用（null は末尾に配置）
        valueA = a.keydate || '9999-99-99'; // null の場合は最大値として扱う
        valueB = b.keydate || '9999-99-99';
      }

      // 文字列型の場合のみ比較を行う
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // null 値を考慮した比較ロジック
        const isNullA = a.keydate === null;
        const isNullB = b.keydate === null;

        if (isNullA && !isNullB) {
          // a が null の場合、常に a > b とする（末尾に配置）
          return 1;
        }
        if (!isNullA && isNullB) {
          // b が null の場合、常に a < b とする（末尾に配置）
          return -1;
        }

        // 通常の文字列比較
        return sortOrder === 'ASC'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // 比較不能な場合は 0 を返す
      return 0;
    });

    // ページネーション
    const skip = (page - 1) * limit;
    const paginatedHistories = histories.slice(skip, skip + limit);

    // 次のページがあるかどうかを判定
    const hasNext = skip + limit < histories.length;

    // HistoryItem[] を HistoryContainer[] に変換
    const result = paginatedHistories.map((item) => ({
      id: item.historyid,
      date: item.date,
      keydate: item.keydate,
      title: item.title,
      system: item.system,
      report: item.report,
      imgURL: item.imgURL,
      private: item.private,
      childblock: item.childblock,
    }));

    console.log(result);
    return {
      data: result,
      hasNext,
    };
  }

  /**
   * ヒストリ【日時指定】取得API
   * @param user_number - ユーザー番号
   * @param page - 取得するページ番号（1から始まる）
   * @param limit - 1ページあたりの最大件数
   * @param point - 指定日時
   * @param sortOrder - 昇順 ('ASC') または降順 ('DESC')
   * @returns 履歴データと次のページの有無
   */
  async getpointHistories(
    user_number: number,
    page: number,
    limit: number,
    point: string, // 並び替え条件（例: '2023'）
    sortOrder: 'ASC' | 'DESC' // 昇順 or 降順
  ): Promise<{ data: HistoryContainer[]; hasNext: boolean }> {
    // user_number に合致する History エンティティを取得
    const history = await this.historyRepository.findOne({
      where: { user_number },
      relations: ['histories'], // histories 配列を含める
    });

    if (!history) {
      // 対応する履歴が存在しない場合
      return {
        data: [],
        hasNext: false,
      };
    }

    // フィルタリング
    let histories = history.histories.filter((item) =>
      item.date?.some((date) => date.startsWith(point))
    );

    // 並び替え処理
    histories.sort((a, b) => {
      const firstDateA = a.date?.find((date) => date.startsWith(point)) || '';
      const firstDateB = b.date?.find((date) => date.startsWith(point)) || '';

      return sortOrder === 'ASC'
        ? firstDateA.localeCompare(firstDateB)
        : firstDateB.localeCompare(firstDateA);
    });

    // ページネーション
    const skip = (page - 1) * limit;
    const paginatedHistories = histories.slice(skip, skip + limit);

    // 次のページがあるかどうかを判定
    const hasNext = skip + limit < histories.length;

    // HistoryItem[] を HistoryContainer[] に変換
    const result = paginatedHistories.map((item) => ({
      id: item.historyid,
      date: item.date,
      keydate: item.keydate,
      title: item.title,
      system: item.system,
      report: item.report,
      imgURL: item.imgURL,
      private: item.private,
      childblock: item.childblock,
    }));

    return {
      data: result,
      hasNext,
    };
  }
}
