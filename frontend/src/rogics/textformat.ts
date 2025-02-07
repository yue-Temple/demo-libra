/**
 * テキストのフォーマットを整える関数
 * @param text - 変換するテキストデータ
 */
export const formatContent = (text: string) => {
  // 見出しの処理（直後の改行を無視）
  let formattedText = text.replace(
    /^(#+)\s(.+?)(?=\n|$)/gm,
    (match, p1, p2) => {
      const level = p1.length;
      return `<h${level}>${p2}</h${level}>`;
    }
  );

  // 残りの改行を <br> タグに変換
  formattedText = formattedText.replace(/\n/g, '<br>');

  // *文字* を太字に変換
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  return formattedText;
};

/**
 * テキストのフォーマットを整える関数 ※見出し処理なし
 * @param text - 変換するテキストデータ
 */
export const formatContent2 = (text: string) => {
  // 見出しの処理（直後の改行を無視）
  let formattedText = text;

  // 残りの改行を <br> タグに変換
  formattedText = formattedText.replace(/\n/g, '<br>');

  // *文字* を太字に変換
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  return formattedText;
};

// プロフィールテキストボックス用
export const formatContent3 = (text: string) => {
  // 見出しの処理（直後の改行を無視）
  let formattedText = text.replace(
    /^(#+)\s(.+?)\n?/gm, // `\n?` を追加して、改行を一緒に消す
    (match, p1, p2) => {
      const level = p1.length; // # の数を見出しレベルとする
      return `<span class="f${level}">${p2}</span>`;
    }
  );

  // 残りの改行を <br> タグに変換
  formattedText = formattedText.replace(/\n/g, '<br>');

  // *文字* を太字に変換
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  return formattedText;
};

// 見出し付与＋改行＋太字
export const formatContent4 = (text: string) => {
  // 見出しの処理（直後の改行を無視）
  let formattedText = text.replace(
    /^(#+)\s(.+?)(?:\n|$)/gm, // 末尾のケースも考慮
    (match, p1, p2) => {
      const level = p1.length; // # の数を見出しレベルとする
      return `<h${level}>${p2}</h${level}>`;
    }
  );

  // 先頭の改行を考慮し、最初が改行なら `<br>` を追加
  formattedText = formattedText.replace(/^\n/, '<br>');

  // 残りの改行を <br> タグに変換
  formattedText = formattedText.replace(/\n/g, '<br>');

  // *文字* を太字に変換
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

  return formattedText;
};
