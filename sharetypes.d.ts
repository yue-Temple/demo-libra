// トークンの型定義
interface JwtPayload {
  user_id: string;
  user_name: string;
  user_number: string;
  user_role: string;
  user_email: string;
  user_googleid?: string; 
  iat?: number; // トークン発行時刻 (issued at) ※自動生成
  exp?: number; // トークン有効期限 (expiration) ※自動生成
}


// ユーザー（取得用） ※未使用
export interface userData{
  user_name: string | null;
  user_number: number;
  user_role: string | null;
  user_email: string | null;
  user_google: string | null;
  user_icon: string; 
};

// メニュー|利用機能の設定データ型
export interface Features {
  name: string;
  value: number;
  title: string;// ユーザー命名name
}
// メニュー|nameオプション定義（定数）
export const menu_name = ['profile', 'history', 'chara', 'data', 'relation'];

// // メニュー|レイアウトデザイン ※未使用
// export enum LayoutType {
//   layout1 = "layout1",
//   layout2 = "layout2",
//   layout3 = "layout3",
//   // ★ここに新しい値を追加
// }


// ------------------------------------------------------------------------------
// 汎用インフォブロック
export interface BaseInfoBlock {
  id: string;
  type: string;
  content: string;
}

// ブロックタイプ別ディスクリミネイテッドユニオン
interface TextBlock extends BaseInfoBlock {
  type: 'text';
  styleType?: StyleType;

}
interface ButtonBlock extends BaseInfoBlock {
  type: 'button';
  buttonType?: ButtonType;
  buttons?: Button[];
}
interface TextButton extends BaseInfoBlock {
  type: 'textbutton';
  styleType?: StyleType;
  button: Button;
}
interface ImageBlock extends BaseInfoBlock {
  type: 'img';
  imageUrl?: string; // 画像ブロック固有のプロパティ
}
interface CSBlock extends BaseInfoBlock {
  type: 'CS';
  csType?: string; // CSブロック固有のプロパティ
}
//★↑新しいタイプを追加

type InfoBlock = TextBlock | ButtonBlock | TextButton | ImageBlock | CSBlock; //★←新しいタイプを追加



// ブロック｜ボタン構造
export interface Button {
  title: string | null;
  title_color: string | null;
  link_url: string | null;
  image_url: string  | File | null;
  image_object_key: string | null;
  icon_url: string | null;
}

// ブロック｜テキストブロックデザイン
export enum StyleType {
  None = "none",
  Solid = "solid",
  Dashed = "dashed",
  Double = "double"
  // ★ここに新しい値を追加
}
// ブロック｜ボタンブロックデザイン
export enum ButtonType {
  SmallOneButton = 'small1-button',
  BigThreeButton = 'big3-button',
  SmallThreeButton = 'small3-button',
  SmallFourButton = 'small4-button',
  // ★ここに新しい値を追加
}


// ------------------------------------------------------------------------------
// セッションヒストリー
export interface HistoryContainer {
  id: string;
  date:string[] | null;
  keydate:string | null;
  title:string | null;
  system:string | null;
  report:string | null;
  imgURL:string | File | null;
  image_object_key: string | null;
  private:boolean;
  childblock:InfoBlock[] | [];
}

// 保存用セッションヒストリー
export interface saveHistoryContainer {
  id: string;
  date:string[] | null;
  keydate:string | null;
  title:string | null;
  system:string | null;
  report:string | null;
  imgURL:string | null;
  image_object_key: string | null;
  private:boolean;
  childblock:InfoBlock[] | [];
}