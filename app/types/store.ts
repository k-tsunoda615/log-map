export type StoreCategory =
  | "インドカレー"
  | "欧風カレー"
  | "スープカレー"
  | "スパイスカレー"
  | "その他";

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
