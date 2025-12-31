<template>
  <div class="h-screen">
    <Navbar />
    <div class="flex h-[calc(100vh-4rem)] overflow-auto">
      <div class="h-full bg-surface-0 dark:bg-surface-900">
        <CsSidebar />
      </div>
      <div class="flex-1 h-full bg-surface-50 dark:bg-surface-800 overflow-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/kits/navbar/index.vue'
import CsSidebar from '@/components/kits/cs_sidebar/index.vue'
</script>
