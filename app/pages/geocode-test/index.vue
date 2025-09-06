<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>🗺️ ジオコーディングAPI テスト</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" color="white" variant="text">
        <v-icon>mdi-arrow-left</v-icon>
        戻る
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>住所 → 緯度経度変換</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="address"
                  label="住所を入力してください"
                  variant="outlined"
                  placeholder="例: 東京都渋谷区道玄坂1-2-3"
                  class="mb-4"
                ></v-text-field>

                <v-btn
                  color="primary"
                  @click="geocodeAddress"
                  :loading="loading"
                  :disabled="!address.trim()"
                  block
                >
                  ジオコーディング実行
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>結果</v-card-title>
              <v-card-text>
                <div v-if="loading" class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                  <p class="mt-2">ジオコーディング中...</p>
                </div>

                <div v-else-if="error" class="text-center">
                  <v-alert type="error" variant="tonal">
                    <v-icon>mdi-alert-circle</v-icon>
                    {{ error }}
                  </v-alert>
                </div>

                <div v-else-if="result" class="text-center">
                  <v-alert type="success" variant="tonal" class="mb-4">
                    <v-icon>mdi-check-circle</v-icon>
                    ジオコーディング成功！
                  </v-alert>

                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon>mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>住所</v-list-item-title>
                      <v-list-item-subtitle>{{
                        result.formatted_address
                      }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon>mdi-crosshairs-gps</v-icon>
                      </template>
                      <v-list-item-title>緯度</v-list-item-title>
                      <v-list-item-subtitle>{{
                        result.geometry.location.lat
                      }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon>mdi-crosshairs-gps</v-icon>
                      </template>
                      <v-list-item-title>経度</v-list-item-title>
                      <v-list-item-subtitle>{{
                        result.geometry.location.lng
                      }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon>mdi-map-marker-radius</v-icon>
                      </template>
                      <v-list-item-title>精度</v-list-item-title>
                      <v-list-item-subtitle>{{
                        getLocationType(result.geometry.location_type)
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="copyCoordinates"
                    class="mt-4"
                    block
                  >
                    <v-icon>mdi-content-copy</v-icon>
                    座標をコピー
                  </v-btn>
                </div>

                <div v-else class="text-center text-medium-emphasis">
                  <v-icon size="48" class="mb-2">mdi-map-search</v-icon>
                  <p>住所を入力してジオコーディングを実行してください</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- テスト用のサンプル住所 -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>テスト用サンプル住所</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="sample in sampleAddresses"
                    :key="sample.name"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card
                      variant="outlined"
                      class="cursor-pointer"
                      @click="address = sample.address"
                    >
                      <v-card-text class="pa-3">
                        <div class="text-subtitle2 mb-1">{{ sample.name }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ sample.address }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- API設定状況 -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>API設定状況</v-card-title>
              <v-card-text>
                <v-alert
                  :type="hasApiKey ? 'success' : 'warning'"
                  variant="tonal"
                >
                  <template #prepend>
                    <v-icon>{{
                      hasApiKey ? "mdi-check-circle" : "mdi-alert"
                    }}</v-icon>
                  </template>
                  <div>
                    <strong>{{
                      hasApiKey ? "API Key設定済み" : "API Key未設定"
                    }}</strong
                    ><br />
                    {{
                      hasApiKey
                        ? "Google Geocoding APIが利用可能です"
                        : "環境変数にGOOGLE_GEOCODING_API_KEYまたはGOOGLE_MAPS_API_KEYを設定してください"
                    }}
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// データ
const address = ref("");
const result = ref<any>(null);
const error = ref("");
const loading = ref(false);

// API Keyの確認
const hasApiKey = computed(() => {
  const config = useRuntimeConfig();
  return !!config.public.googleMapsApiKey;
});

// サンプル住所
const sampleAddresses = [
  {
    name: "渋谷駅",
    address: "東京都渋谷区道玄坂1-2-3",
  },
  {
    name: "新宿駅",
    address: "東京都新宿区新宿3-38-1",
  },
  {
    name: "東京駅",
    address: "東京都千代田区丸の内1-9-1",
  },
  {
    name: "六本木ヒルズ",
    address: "東京都港区六本木6-10-1",
  },
  {
    name: "浅草寺",
    address: "東京都台東区浅草2-3-1",
  },
  {
    name: "東京スカイツリー",
    address: "東京都墨田区押上1-1-2",
  },
];

// ジオコーディング実行
const geocodeAddress = async () => {
  if (!address.value.trim()) return;

  loading.value = true;
  error.value = "";
  result.value = null;

  try {
    const response = (await $fetch("/api/geocode", {
      params: {
        address: address.value,
      },
    })) as any;

    if (
      response.status === "OK" &&
      response.results &&
      response.results.length > 0
    ) {
      result.value = response.results[0];
    } else {
      error.value = `ジオコーディングに失敗しました: ${response.status}`;
    }
  } catch (err: any) {
    error.value =
      err.data?.statusMessage ||
      err.message ||
      "ジオコーディングに失敗しました";
  } finally {
    loading.value = false;
  }
};

// 位置精度の説明
const getLocationType = (locationType: string) => {
  const types: Record<string, string> = {
    ROOFTOP: "屋根上（最高精度）",
    RANGE_INTERPOLATED: "範囲内補間",
    GEOMETRIC_CENTER: "幾何学的中心",
    APPROXIMATE: "近似値",
  };
  return types[locationType] || locationType;
};

// 座標をコピー
const copyCoordinates = async () => {
  if (!result.value) return;

  const coords = `${result.value.geometry.location.lat}, ${result.value.geometry.location.lng}`;

  try {
    await navigator.clipboard.writeText(coords);
    // 簡単な通知（実際のアプリでは適切な通知システムを使用）
    alert("座標をクリップボードにコピーしました！");
  } catch (err) {
    console.error("コピーに失敗しました:", err);
  }
};

// メタ情報
useHead({
  title: "🗺️ ジオコーディングAPI テスト",
  meta: [
    { name: "description", content: "Google Geocoding APIの動作テストページ" },
  ],
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
