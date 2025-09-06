<template>
  <div ref="containerRef" class="map-wrapper" style="position: relative">
    <template v-if="!apiKeyExists">
      <div class="fallback">
        <div class="icon">🗺️</div>
        <h3>Google Maps API Key が必要です</h3>
        <p>環境変数に GOOGLE_MAPS_API_KEY を設定してください。</p>
        <ol>
          <li>.env を作成</li>
          <li>GOOGLE_MAPS_API_KEY="your_api_key" を追加</li>
          <li>サーバーを再起動</li>
        </ol>
      </div>
    </template>

    <template v-else>
      <v-skeleton-loader v-if="loading" type="image" class="skeleton" />
      <div ref="mapRef" class="map-el"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import type { Store } from "~/types";

const props = defineProps<{
  stores: Store[];
  apiKeyExists: boolean;
  getCategoryIcon: (category: Store["category"]) => string;
}>();
const emit = defineEmits<{ (e: "select", store: Store): void }>();

declare const google: any;

const mapRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
let map: any = null;
let markers: any[] = [];
const loading = ref<boolean>(true);
let resizeObserver: ResizeObserver | null = null;

const initMap = () => {
  if (!mapRef.value) return;
  const tokyo = { lat: 35.6762, lng: 139.6503 };
  map = new google.maps.Map(mapRef.value, {
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

const clearMarkers = () => {
  markers.forEach((m) => m.setMap(null));
  markers = [];
};

const createMarkers = () => {
  if (!map) return;
  clearMarkers();
  props.stores.forEach((store) => {
    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map,
      title: store.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1976D2" stroke="#fff" stroke-width="2"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${props.getCategoryIcon(
              store.category
            )}</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      },
    });
    marker.addListener("click", () => {
      // 中心移動とズーム（UX向上）
      if (map?.setCenter) map.setCenter({ lat: store.lat, lng: store.lng });
      if (map?.setZoom) map.setZoom(16);
      emit("select", store);
    });
    markers.push(marker);
  });
};

const setupResizeObserver = () => {
  if (!containerRef.value) return;
  resizeObserver = new ResizeObserver(() => {
    if (!map || typeof google === "undefined") return;
    const center = map.getCenter ? map.getCenter() : null;
    if (google.maps?.event) {
      google.maps.event.trigger(map, "resize");
    }
    if (center) map.setCenter(center);
  });
  resizeObserver.observe(containerRef.value);
};

const waitForGoogle = (timeoutMs = 8000) =>
  new Promise<boolean>((resolve) => {
    const start = Date.now();
    const tick = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((globalThis as any).google?.maps) return resolve(true);
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });

onMounted(async () => {
  if (!props.apiKeyExists) {
    loading.value = false;
    return;
  }
  const ready = await waitForGoogle();
  if (!ready) {
    loading.value = false;
    return;
  }
  initMap();
  createMarkers();
  loading.value = false;
  setupResizeObserver();
});

watch(
  () => props.stores,
  () => {
    createMarkers();
  }
);

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value)
    resizeObserver.unobserve(containerRef.value);
  clearMarkers();
  map = null;
});
</script>

<style scoped>
.map-el {
  height: 100vh;
  width: 100%;
}
.skeleton {
  position: absolute;
  inset: 0;
}
.fallback {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
}
.fallback .icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.fallback h3 {
  margin: 0 0 8px 0;
  color: #333;
}
.fallback p {
  margin: 0 0 16px 0;
  font-size: 14px;
}
.fallback ol {
  max-width: 360px;
  text-align: left;
  margin: 0 auto;
}
</style>
