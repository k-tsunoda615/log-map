<template>
  <div>
    <ViewPc v-if="!$vuetify.display.mobile" />
    <ViewSp v-else />
  </div>
</template>

<script setup lang="ts">
import ViewPc from "~/components/views/pc/index.vue";
import ViewSp from "~/components/views/sp/index.vue";
</script>

<style scoped></style>
