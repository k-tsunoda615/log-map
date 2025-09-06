<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-btn
        icon
        class="mr-2"
        @click="showFilterDrawer = true"
        aria-label="フィルタを開く"
      >
        <v-icon>mdi-filter</v-icon>
      </v-btn>
      <v-app-bar-title>🍛 カレー屋さんマップ</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/geocode-test" class="mr-2">
        <v-icon>mdi-map-search</v-icon>
      </v-btn>
      <v-btn icon @click="showAbout = true">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- フィルタドロワー -->
    <UiFilterDrawerSP
      v-model="showFilterDrawer"
      :search-query="searchQuery"
      @update:searchQuery="(v: string) => (searchQuery = v)"
      :selected-category="selectedCategory"
      @update:selectedCategory="(v: StoreCategory) => (selectedCategory = v)"
      :filtered-stores="filteredStores"
      :selected-store-id="selectedStore?.id ?? null"
      :category-options="categoryOptions"
      :get-category-icon="getCategoryIcon"
      @select="selectStore"
    />

    <v-main>
      <v-container fluid class="pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <MapWrapper
              :stores="filteredStores"
              :api-key-exists="hasGoogleMapsApiKey"
              :get-category-icon="getCategoryIcon"
              @select="selectStore"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <StoreDetailContainer :store="selectedStore" v-model="showStoreDetail" />

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
import type { Store, StoreCategory } from "~/types";
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
const showFilterDrawer = ref(false);
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

<style scoped></style>
