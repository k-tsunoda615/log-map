<template>
  <v-card class="d-flex flex-column" height="100vh">
    <div v-if="store" class="flex-grow-1">
      <v-card-title class="d-flex align-center">
        <v-avatar size="40" color="primary" variant="tonal" class="mr-3">
          <span class="text-caption">{{
            getCategoryIcon(store.category)
          }}</span>
        </v-avatar>
        <div>
          <div class="text-h6">{{ store.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ store.category }}
          </div>
        </div>
      </v-card-title>

      <v-card-text>
        <div class="mb-3">
          <v-icon class="mr-2">mdi-map-marker</v-icon>
          <span class="text-body2">{{ store.address }}</span>
        </div>

        <div v-if="!hasGoogleMapsApiKey" class="mb-3">
          <v-alert type="info" variant="tonal" density="compact">
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            Google Maps API
            Keyが設定されていないため、地図上での位置確認はできません
          </v-alert>
        </div>

        <div v-if="store.comment" class="mb-3">
          <v-icon class="mr-2">mdi-comment-text</v-icon>
          <span class="text-body2">{{ store.comment }}</span>
        </div>

        <div v-if="store.instagramUrl" class="mb-3">
          <v-btn
            :href="store.instagramUrl"
            target="_blank"
            color="pink"
            variant="outlined"
            prepend-icon="mdi-instagram"
            class="mb-2"
            block
          >
            Instagramを見る
          </v-btn>
          <v-skeleton-loader
            v-if="embedLoading"
            type="image"
            class="mt-2 skeleton-embed"
          />
          <div v-show="!embedLoading" ref="embedEl" class="mt-2"></div>
        </div>
      </v-card-text>
    </div>

    <div
      v-else
      class="d-flex flex-column align-center justify-center flex-grow-1 pa-4"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4"
        >mdi-store-outline</v-icon
      >
      <h3 class="text-h6 text-grey-lighten-1 mb-2">店舗を選択してください</h3>
      <p class="text-body2 text-grey-lighten-1 text-center">
        左のリストから店舗を選択すると、<br />
        詳細情報がここに表示されます
      </p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import type { Store } from "~/types";

const props = defineProps<{ store: Store | null }>();

const embedEl = ref<HTMLElement | null>(null);
const embedLoading = ref<boolean>(false);

const hasGoogleMapsApiKey = computed(() => {
  const config = useRuntimeConfig();
  return !!config.public.googleMapsApiKey;
});

const getCategoryIcon = (category: Store["category"]): string => {
  const icons: Record<Store["category"], string> = {
    インドカレー: "🍛",
    欧風カレー: "🥘",
    スープカレー: "🍲",
    スパイスカレー: "🌶️",
    その他: "🍽️",
  } as const;
  return icons[category] || "🍽️";
};

const ensureInstagramScript = () => {
  if (typeof window === "undefined") return;
  if ((window as any).instgrm) return;
  const script = document.createElement("script");
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  document.head.appendChild(script);
};

const renderInstagram = (url: string) => {
  if (!embedEl.value) return;
  if (!(window as any).instgrm) return;
  embedLoading.value = true;
  embedEl.value.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`;
  (window as any).instgrm.Embeds.process();
  setTimeout(() => {
    embedLoading.value = false;
  }, 800);
};

onMounted(() => {
  ensureInstagramScript();
});

watch(
  () => props.store?.instagramUrl,
  (url) => {
    if (!url) return;
    setTimeout(() => renderInstagram(url), 300);
  },
  { immediate: true }
);
</script>

<style scoped>
.skeleton-embed {
  min-height: 320px;
}
</style>
