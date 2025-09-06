<template>
  <div>
    <StoreDetailPanelPC v-if="!$vuetify.display.mobile" :store="store" />
    <StoreDetailBottomSheetSP v-else v-model="show" :store="store" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Store } from "~/types";
import StoreDetailPanelPC from "./StoreDetailPanelPC.vue";
import StoreDetailBottomSheetSP from "./StoreDetailBottomSheetSP.vue";

const props = defineProps<{ store: Store | null; modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void }>();

const show = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (show.value = v)
);
watch(show, (v) => emit("update:modelValue", v));
</script>

<style scoped></style>
