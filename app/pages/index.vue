<template>
  <v-app>
    <!-- ヘッダー -->
    <v-app-bar color="primary" dark>
      <v-app-bar-title>🍛 カレー屋さんマップ</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-chip
        v-if="!hasGoogleMapsApiKey"
        color="warning"
        variant="tonal"
        size="small"
        class="mr-2"
      >
        <v-icon start>mdi-alert</v-icon>
        デモモード
      </v-chip>
      <v-btn icon to="/geocode-test" class="mr-2">
        <v-icon>mdi-map-search</v-icon>
      </v-btn>
      <v-btn icon @click="showAbout = true">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0">
        <v-row no-gutters>
          <!-- サイドパネル -->
          <v-col cols="12" md="4" lg="3">
            <v-card height="100vh" class="d-flex flex-column">
              <!-- 検索・フィルタセクション -->
              <v-card-title class="pb-2">
                <v-icon class="mr-2">mdi-magnify</v-icon>
                カレー店を探す
              </v-card-title>

              <v-card-text class="pt-0">
                <!-- 検索バー -->
                <v-text-field
                  v-model="searchQuery"
                  label="店名・住所で検索"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  class="mb-4"
                ></v-text-field>

                <!-- カテゴリフィルタ -->
                <v-select
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  label="カテゴリ"
                  variant="outlined"
                  density="compact"
                  clearable
                  class="mb-4"
                ></v-select>

                <!-- 店舗リスト -->
                <div class="text-subtitle2 mb-2">
                  店舗一覧 ({{ filteredStores.length }}件)
                </div>

                <v-list density="compact" class="pa-0">
                  <v-list-item
                    v-for="store in filteredStores"
                    :key="store.id"
                    @click="selectStore(store)"
                    :class="{
                      'bg-primary-lighten-5': selectedStore?.id === store.id,
                    }"
                  >
                    <template #prepend>
                      <v-avatar size="40" color="primary" variant="tonal">
                        <span class="text-caption">{{
                          getCategoryIcon(store.category)
                        }}</span>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-body2 font-weight-medium">
                      {{ store.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="text-caption">
                      {{ store.category }} • {{ store.address }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- マップエリア -->
          <v-col cols="12" md="8" lg="6">
            <div id="map" style="height: 100vh; width: 100%"></div>
          </v-col>

          <!-- 右カラム: 店舗詳細（PC固定/ SPはボトムシート） -->
          <v-col cols="12" lg="3" class="d-none d-lg-block">
            <StoreDetailContainer
              :store="selectedStore"
              v-model="showStoreDetail"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 店舗詳細（SPはボトムシートで表示） -->
    <StoreDetailContainer :store="selectedStore" v-model="showStoreDetail" />

    <!-- About モーダル -->
    <v-dialog v-model="showAbout" max-width="500px">
      <v-card>
        <v-card-title>🍛 カレー屋さんマップについて</v-card-title>
        <v-card-text>
          <p class="text-body2 mb-3">
            厳選されたカレー店を地図で簡単に探せるWebアプリです。
          </p>
          <p class="text-body2 mb-3">モバイルでも快適にご利用いただけます。</p>

          <v-alert
            v-if="!hasGoogleMapsApiKey"
            type="info"
            variant="tonal"
            class="mb-3"
          >
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div>
              <strong>現在デモモードで動作中</strong><br />
              Google Maps API
              Keyが設定されていないため、地図は表示されませんが、店舗情報は確認できます。
            </div>
          </v-alert>

          <v-alert v-else type="success" variant="tonal" class="mb-3">
            <template #prepend>
              <v-icon>mdi-check-circle</v-icon>
            </template>
            <div>
              <strong>完全版で動作中</strong><br />
              Google Maps API Keyが設定されており、地図機能が利用できます。
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showAbout = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Store } from "~/types";
import { useStores } from "~/composables/useStores";

// データ（composable から取得）
const {
  stores,
  searchQuery,
  selectedCategory,
  categoryOptions,
  filteredStores,
  getCategoryIcon,
  loadSampleData,
} = useStores();
const selectedStore = ref<Store | null>(null);
const showStoreDetail = ref(false);
const showAbout = ref(false);

// Google Maps関連
declare const google: any;
let map: any = null;
let markers: any[] = [];

// フィルタリングとアイコン取得は useStores に委譲

// Google Maps初期化
/**
 * @description Google Maps初期化
 * @returns {void}
 */
const initMap = () => {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // 東京を中心とした初期位置
  const tokyo = { lat: 35.6762, lng: 139.6503 };

  map = new google.maps.Map(mapElement, {
    zoom: 12,
    center: tokyo,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });
};

// マーカー作成
/**
 * @description 店舗データを元にマーカー（ピン）を作成する関数です
 * @param {Store[]} stores - 店舗データ
 * @param {google.maps.Map} map - Google Mapsインスタンス
 * @param {Function} getCategoryIcon - カテゴリアイコンを取得する関数
 * @param {Function} selectStore - 店舗選択関数
 * @param {Function} markers - マーカー配列
 * @param {Function} marker - マーカーインスタンス
 * @param {Function} marker.addListener - マーカークリックイベントリスナーを追加する関数
 * @param {Function} marker.setMap - マーカーを地図に追加する関数
 * @returns {void}
 */
const createMarkers = () => {
  if (!map) return;

  // 既存のマーカーをクリア
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 新しいマーカーを作成
  stores.value.forEach((store: Store) => {
    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map: map,
      title: store.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1976D2" stroke="#fff" stroke-width="2"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${getCategoryIcon(
              store.category
            )}</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      },
    });

    // マーカークリックイベント
    marker.addListener("click", () => {
      selectStore(store);
    });

    markers.push(marker);
  });
};

// 店舗選択
/**
 * @description 店舗選択
 * @param {Store} store - 店舗データ
 * @param {Ref<Store | null>} selectedStore - 選択された店舗データ
 * @param {Ref<boolean>} showStoreDetail - 店舗詳細モーダルの表示状態
 * @param {google.maps.Map} map - Google Mapsインスタンス
 * @param {Function} hasGoogleMapsApiKey - Google Maps API Keyの確認
 * @param {Function} loadInstagramEmbed - Instagram埋め込み読み込み
 * @param {Function} loadSampleData - サンプルデータ読み込み
 * @returns {void}
 */
const selectStore = (store: Store) => {
  selectedStore.value = store;
  showStoreDetail.value = true;

  // マップの中心を選択された店舗に移動（API Keyがある場合のみ）
  if (map && hasGoogleMapsApiKey.value) {
    map.setCenter({ lat: store.lat, lng: store.lng });
    map.setZoom(16);
  }

  // Instagram埋め込みの読み込み
  if (store.instagramUrl) {
    loadInstagramEmbed(store.instagramUrl);
  }
};

// Instagram埋め込み読み込み
const loadInstagramEmbed = (instagramUrl: string) => {
  // Instagram埋め込みスクリプトの動的読み込み
  const script = document.createElement("script");
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  document.head.appendChild(script);

  // 埋め込み要素の準備
  setTimeout(() => {
    const embedElement = document.getElementById("instagram-embed");
    if (embedElement && (window as any).instgrm) {
      embedElement.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${instagramUrl}" data-instgrm-version="14"></blockquote>`;
      (window as any).instgrm.Embeds.process();
    }
  }, 1000);
};

// サンプルデータ読み込みは useStores に委譲

// フィルタ変更時のマーカー更新
watch([searchQuery, selectedCategory], () => {
  createMarkers();
});

// Google Maps API Keyの確認
const hasGoogleMapsApiKey = computed(() => {
  const config = useRuntimeConfig();
  return !!config.public.googleMapsApiKey;
});

// フォールバック用の静的地図表示
const showFallbackMap = () => {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  mapElement.innerHTML = `
    <div style="
      height: 100%;
      width: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
      font-family: 'Roboto', sans-serif;
    ">
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
        <h3 style="margin: 0 0 8px 0; color: #333;">Google Maps API Key が必要です</h3>
        <p style="margin: 0 0 16px 0; font-size: 14px;">
          地図を表示するには、環境変数に GOOGLE_MAPS_API_KEY を設定してください
        </p>
        <div style="
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: left;
          max-width: 400px;
        ">
          <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">設定手順:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
            <li>.env ファイルを作成</li>
            <li>GOOGLE_MAPS_API_KEY="your_api_key" を追加</li>
            <li>開発サーバーを再起動</li>
          </ol>
        </div>
        <div style="
          background: #e3f2fd;
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          border-left: 4px solid #2196f3;
        ">
          <p style="margin: 0; font-size: 14px; color: #1976d2;">
            <strong>現在の店舗データ:</strong> サンプルデータが表示されています
          </p>
        </div>
      </div>
    </div>
  `;
};

// コンポーネントマウント時
onMounted(async () => {
  // Google Maps API Keyの確認
  if (!hasGoogleMapsApiKey.value) {
    console.warn(
      "Google Maps API Key is not configured. Showing fallback map."
    );
    showFallbackMap();
    // サンプルデータは表示する
    loadSampleData();
    return;
  }

  // Google Maps APIの読み込み確認
  if (typeof google === "undefined") {
    console.error("Google Maps API is not loaded");
    showFallbackMap();
    loadSampleData();
    return;
  }

  // マップ初期化
  initMap();

  // サンプルデータ読み込み
  loadSampleData();

  // マーカー作成
  createMarkers();
});

// メタ情報
useHead({
  title: "🍛 カレー屋さんマップ",
  meta: [
    {
      name: "description",
      content: "厳選されたカレー店を地図で簡単に探せるWebアプリ",
    },
  ],
});
</script>

<style scoped>
#map {
  border-radius: 0;
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.bg-primary-lighten-5 {
  background-color: rgba(25, 118, 210, 0.08) !important;
}
</style>
