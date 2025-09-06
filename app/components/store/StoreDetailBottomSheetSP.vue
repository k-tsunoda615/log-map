<template>
  <v-bottom-sheet v-model="internal" :retain-focus="false">
    <v-sheet class="text-center" rounded="t">
      <div class="py-2">
        <v-divider
          class="mx-auto"
          style="
            width: 40px;
            height: 4px;
            background-color: #ccc;
            border-radius: 2px;
          "
        ></v-divider>
      </div>

      <v-card-title class="d-flex align-center justify-center pb-2">
        <v-avatar size="40" color="primary" variant="tonal" class="mr-3">
          <span class="text-caption">{{
            store ? getCategoryIcon(store.category) : ""
          }}</span>
        </v-avatar>
        <div class="text-center">
          <div class="text-h6">{{ store?.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ store?.category }}
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="mb-3">
          <v-icon class="mr-2">mdi-map-marker</v-icon>
          <span class="text-body2">{{ store?.address }}</span>
        </div>

        <div v-if="store?.comment" class="mb-3">
          <v-icon class="mr-2">mdi-comment-text</v-icon>
          <span class="text-body2">{{ store?.comment }}</span>
        </div>

        <div v-if="store?.instagramUrl" class="mb-3">
          <v-btn
            :href="store?.instagramUrl"
            target="_blank"
            color="pink"
            variant="outlined"
            prepend-icon="mdi-instagram"
            class="mb-2"
            block
          >
            Instagramを見る
          </v-btn>
          <div ref="embedEl" class="mt-2"></div>
        </div>
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-btn
          color="primary"
          variant="outlined"
          @click="internal = false"
          block
          class="mb-2"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import type { Store } from "~/types";

const props = defineProps<{ modelValue: boolean; store: Store | null }>();
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void }>();

const internal = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (internal.value = v)
);
watch(internal, (v) => emit("update:modelValue", v));

const embedEl = ref<HTMLElement | null>(null);

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
  embedEl.value.innerHTML = `<blockquote class=\"instagram-media\" data-instgrm-permalink=\"${url}\" data-instgrm-version=\"14\"></blockquote>`;
  (window as any).instgrm.Embeds.process();
};

onMounted(() => {
  ensureInstagramScript();
});

watch(
  () => props.store?.instagramUrl,
  (url) => {
    if (!url) return;
    setTimeout(() => renderInstagram(url), 500);
  },
  { immediate: true }
);
</script>

<style scoped></style>
