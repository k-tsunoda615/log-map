<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-btn
        icon
        class="mr-2"
        @click="showFilterPanel = !showFilterPanel"
        :aria-expanded="showFilterPanel"
        aria-controls="filter-panel"
        aria-label="フィルタパネルの表示切り替え"
      >
        <v-icon>{{
          showFilterPanel ? "mdi-chevron-left" : "mdi-filter"
        }}</v-icon>
      </v-btn>
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
          <!-- 左: フィルタ/検索（開閉可能） -->
          <v-col v-if="showFilterPanel" cols="12" lg="3">
            <v-card height="100vh" class="d-flex flex-column" id="filter-panel">
              <v-card-title class="pb-2">
                <v-icon class="mr-2">mdi-magnify</v-icon>
                カレー店を探す
              </v-card-title>

              <v-card-text class="pt-0">
                <v-text-field
                  v-model="searchQuery"
                  label="店名・住所で検索"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  class="mb-4"
                />

                <v-select
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  label="カテゴリ"
                  variant="outlined"
                  density="compact"
                  clearable
                  class="mb-4"
                />

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
                    <v-list-item-title class="text-body2 font-weight-medium">{{
                      store.name
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption"
                      >{{ store.category }} •
                      {{ store.address }}</v-list-item-subtitle
                    >
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 中央: マップ -->
          <v-col cols="12" :lg="showFilterPanel ? 6 : 9">
            <MapWrapper
              :stores="filteredStores"
              :api-key-exists="hasGoogleMapsApiKey"
              :get-category-icon="getCategoryIcon"
              @select="selectStore"
            />
          </v-col>

          <!-- 右: 詳細 -->
          <v-col cols="12" lg="3" class="d-none d-lg-block">
            <StoreDetailContainer
              :store="selectedStore"
              v-model="showStoreDetail"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="showAbout" max-width="500px">
      <v-card>
        <v-card-title>🍛 カレー屋さんマップについて</v-card-title>
        <v-card-text>
          <p class="text-body2 mb-3">
            厳選されたカレー店を地図で簡単に探せるWebアプリです。
          </p>
          <p class="text-body2 mb-3">モバイルでも快適にご利用いただけます。</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showAbout = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Store } from "~/types";
import { useStores } from "~/composables/useStores";

const {
  stores,
  searchQuery,
  selectedCategory,
  categoryOptions,
  filteredStores,
  getCategoryIcon,
  loadSampleData,
} = useStores();

const { selectedStore, showStoreDetail } = useStoreDetail();
const showFilterPanel = ref(true);
const showAbout = ref(false);

const hasGoogleMapsApiKey = computed(() => {
  const config = useRuntimeConfig();
  return !!config.public.googleMapsApiKey;
});

const selectStore = (store: Store) => {
  selectedStore.value = store;
  showStoreDetail.value = true;
};

onMounted(() => {
  loadSampleData();
});
</script>

<style scoped>
.bg-primary-lighten-5 {
  background-color: rgba(25, 118, 210, 0.08) !important;
}
</style>
