import { AppDataSource } from '../data-source';
import { History } from '../entity/History';
import { HistoryItem } from '../entity/HistoryItem';
import { saveHistoryContainer } from '../../../sharetypes';

export class HistorygetService {
  private historyRepository = AppDataSource.getRepository(History);
  private historyItemRepository = AppDataSource.getRepository(HistoryItem);

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
  ): Promise<{ data: saveHistoryContainer[]; hasNext: boolean }> {
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
  ): Promise<{ data: saveHistoryContainer[]; hasNext: boolean }> {
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

  /**
   * ヒストリ詳細 一件取得API
   * @param userNumber
   * @param historyId
   * @returns // 詳細データ一件
   */
  async getHistoryDetail(
    userNumber: number,
    historyId: string
  ): Promise<{ data: saveHistoryContainer | null }> {
    // userNumber に合致する History エンティティを取得
    const history = await this.historyRepository.findOne({
      where: { user_number: userNumber },
      relations: ['histories'], // histories 配列を含める
    });

    if (!history) {
      // 対応する履歴が存在しない場合
      return { data: null };
    }

    // histories 配列から historyId に合致する HistoryItem を検索
    const historyItem = history.histories.find(
      (item) => item.historyid === historyId
    );

    if (!historyItem) {
      // 対応する履歴アイテムが存在しない場合
      return { data: null };
    }

    // HistoryItem を saveHistoryContainer に変換
    const result: saveHistoryContainer = {
      id: historyItem.historyid,
      date: historyItem.date,
      keydate: historyItem.keydate,
      title: historyItem.title,
      system: historyItem.system,
      report: historyItem.report,
      imgURL: historyItem.imgURL,
      private: historyItem.private,
      childblock: historyItem.childblock,
    };

    console.log(result);
    return {
      data: result,
    };
  }
}
