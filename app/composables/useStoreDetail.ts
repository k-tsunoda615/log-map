import { ref } from "vue";
import type { Store } from "~/types";

export const useStoreDetail = () => {
  const selectedStore = ref<Store | null>(null);
  const showStoreDetail = ref(false);

  const selectStore = (store: Store) => {
    selectedStore.value = store;
    showStoreDetail.value = true;
  };

  const closeDetail = () => {
    showStoreDetail.value = false;
  };

  return {
    selectedStore,
    showStoreDetail,
    selectStore,
    closeDetail,
  };
};
