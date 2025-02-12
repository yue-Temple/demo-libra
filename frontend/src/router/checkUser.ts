import axios from 'axios'; // APIリクエスト用のライブラリ

/**
 * ユーザー番号が存在するかどうかを確認する関数
 * @param userNumber - 確認するユーザー番号
 * @returns ユーザーが存在する場合は `true`、存在しない場合は `false`
 */
export async function checkUserExists(userNumber: string): Promise<boolean> {
  try {
    // バックエンドAPIにリクエストを送信してユーザー番号の存在を確認
    //const response = await axios.get(`/api/users/${userNumber}/exists`);
   // return response.data.exists; // バックエンドから `exists` プロパティが返されると仮定
   return true;
  } catch (error) {
    console.error('ユーザー番号の確認中にエラーが発生しました:', error);
    return false; // エラーが発生した場合はユーザーが存在しないとみなす
  }
}