<template>
  <div class="h-screen">
    <Navbar />
    <div class="flex h-[calc(100vh-4rem)] overflow-auto">
      <Sidebar @collapse="toggleCollapse" />
      <div
        class="flex-1 h-full bg-surface-50 dark:bg-surface-800"
        :class="sidebarCollapsed ? 'w-[calc(100vw-4rem)]' : 'w-[calc(100vw-12rem)]'"
      >
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/components/kits/navbar/index.vue'
import Sidebar from '@/components/kits/sidebar/index.vue'

const sidebarCollapsed = ref(false)
const toggleCollapse = (value) => {
  if (value) {
    sidebarCollapsed.value = true
  } else {
    sidebarCollapsed.value = false
  }
}
</script>
