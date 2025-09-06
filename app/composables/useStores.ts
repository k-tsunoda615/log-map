import { ref, computed } from "vue";
import type { Store, StoreCategory } from "~/types";

/**
 * @description 店舗データを管理するカスタムフック
 * @returns {Object}
 * @property {Ref<Store[]>} stores - 店舗データ
 * @property {Ref<string>} searchQuery - 検索クエリ
 * @property {Ref<StoreCategory | null>} selectedCategory - 選択されたカテゴリ
 * @property {Ref<StoreCategory[]>} categoryOptions - カテゴリオプション
 * @property {ComputedRef<Store[]>} filteredStores - フィルタリングされた店舗データ
 * @property {Function} getCategoryIcon - カテゴリアイコンを取得する関数
 * @property {Function} loadSampleData - サンプルデータを読み込む関数
 */
export const useStores = () => {
  const stores = ref<Store[]>([]);
  const searchQuery = ref<string>("");
  const selectedCategory = ref<StoreCategory | null>(null);

  const categoryOptions = [
    { title: "インドカレー", value: "インドカレー" },
    { title: "欧風カレー", value: "欧風カレー" },
    { title: "スープカレー", value: "スープカレー" },
    { title: "スパイスカレー", value: "スパイスカレー" },
    { title: "その他", value: "その他" },
  ] as const;

  const filteredStores = computed(() => {
    let filtered = stores.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (s: Store) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory.value) {
      filtered = filtered.filter(
        (s: Store) => s.category === selectedCategory.value
      );
    }
    return filtered;
  });

  const getCategoryIcon = (category: StoreCategory): string => {
    const icons: Record<StoreCategory, string> = {
      インドカレー: "🍛",
      欧風カレー: "🥘",
      スープカレー: "🍲",
      スパイスカレー: "🌶️",
      その他: "🍽️",
    };
    return icons[category] || "🍽️";
  };

  const loadSampleData = () => {
    stores.value = [
      {
        id: "1",
        name: "カレー屋 サンプル1",
        address: "東京都渋谷区道玄坂1-2-3",
        lat: 35.658,
        lng: 139.7016,
        category: "インドカレー",
        comment: "本格的なインドカレーが楽しめます",
        instagramUrl: "https://www.instagram.com/p/sample1",
      },
      {
        id: "2",
        name: "欧風カレー専門店",
        address: "東京都新宿区歌舞伎町1-1-1",
        lat: 35.6938,
        lng: 139.7034,
        category: "欧風カレー",
        comment: "とろけるルーが自慢の欧風カレー",
      },
      {
        id: "3",
        name: "スープカレー 北海道",
        address: "東京都港区六本木3-2-1",
        lat: 35.6654,
        lng: 139.7296,
        category: "スープカレー",
        comment: "北海道の味を東京で",
      },
    ];
  };

  return {
    stores,
    searchQuery,
    selectedCategory,
    categoryOptions,
    filteredStores,
    getCategoryIcon,
    loadSampleData,
  };
};
