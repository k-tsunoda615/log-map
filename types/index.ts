/**
 * カレーのカテゴリです
 */
export type StoreCategory =
  | "インドカレー"
  | "欧風カレー"
  | "スープカレー"
  | "スパイスカレー"
  | "その他";

/**
 * カレー店の情報です
 * @property {string} id - 店舗ID
 * @property {string} name - 店舗名
 * @property {string} address - 店舗住所
 * @property {number} lat - 店舗緯度
 * @property {number} lng - 店舗経度
 * @property {StoreCategory} category - 店舗カテゴリ
 * @property {string} comment - 店舗コメント
 * @property {string} imageUrl - 店舗画像URL
 * @property {string} instagramUrl - 店舗InstagramURL
 */
export type Store = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: StoreCategory;
  comment?: string;
  imageUrl?: string;
  instagramUrl?: string;
};

export type StoreListResponse = { stores: Store[] };
