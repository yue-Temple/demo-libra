import { AppDataSource } from '../data-source';
import { History } from '../entity/History';
import { HistoryItem } from '../entity/HistoryItem';
import { InfoBlock, saveHistoryContainer } from '../../../sharetypes';

export class HistoryService {
  private historyRepository = AppDataSource.getRepository(History);
  private historyItemRepository = AppDataSource.getRepository(HistoryItem);

  /**
   * 記録追加API
   * saveHistoryContainer 型のデータを受け取り、データベースの histories 配列に追加する
   * @param user_number - ユーザーの user_number
   * @param newHistory - 追加する saveHistoryContainer 型のデータ
   */
  async addHistory(
    user_number: number,
    newHistory: saveHistoryContainer
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

      // データベースを更新
      await this.historyRepository.save(history);
    }
  }

  /**
   * 記録更新API
   * データベースの UserNumber と historyid が一致するデータを更新する
   * @param user_number - ユーザーの user_number
   * @param updateHistoryContent - 更新する HistoryContainer 型のデータ
   */
  async updateHistory(
    user_number: number,
    updateHistoryContent: saveHistoryContainer
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
   * 記録プロフィールのみ更新API
   * 記録更新API
   * history_itemテーブルの childblock 配列のみ更新する。
   * @param user_number - ユーザーの user_number
   * @param historyId - 更新する HistoryItem の historyid
   * @param updateChildblock - 更新する InfoBlock 型のデータ
   */
  async updateHistoryProfile(
    user_number: number,
    historyId: string,
    updateChildblock: InfoBlock[]
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

      // historyId に対応する HistoryItem を取得
      const historyItem = history.histories.find(
        (item) => item.historyid === historyId
      );

      if (!historyItem) {
        throw new Error('HistoryItem not found');
      }

      // childblock を更新
      historyItem.childblock = updateChildblock;

      // 更新を保存
      await this.historyItemRepository.save(historyItem);
    } catch (error) {
      console.error('Error updating history:', error);
      throw new Error('Failed to update history');
    }
  }

  /**
   * 卓歴削除API
   * UserNumber と historyid が一致するデータを削除する
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
}
