<template>
  <div class="h-screen">
    <Navbar />
    <div class="flex h-[calc(100vh-4rem)] overflow-auto">
      <div class="h-full bg-surface-0 dark:bg-surface-900">
        <Sidebar />
      </div>
      <div class="flex-1 h-full bg-surface-50 dark:bg-surface-800">
        <div class="p-4">Admin Dashboard</div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/kits/navbar/index.vue'
import Sidebar from '@/components/kits/sidebar/index.vue'
</script>
