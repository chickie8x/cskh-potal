<template>
  <div
    class="h-full bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300"
    :class="collapsed ? 'w-12' : 'w-40'"
  >
    <!-- Menu -->
    <ul class="flex-1">
      <li
        v-for="item in menuItems"
        :key="item.label"
        @click="select(item)"
        class="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 opacity-70"
        :class="[active === item.label ? 'bg-surface-200 dark:bg-surface-700 opacity-100' : '']"
      >
        <i :class="[item.icon, active === item.label ? 'text-primary' : '']" class="text-lg"></i>

        <span
          class="text-sm font-medium whitespace-nowrap transition-opacity duration-200 flex items-center"
          :class="[
            collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
            active === item.label ? 'text-primary font-bold' : '',
          ]"
        >
          {{ item.label }}
        </span>
      </li>
    </ul>

    <!-- Footer (optional) -->
    <div
      class="border-t border-surface-200 dark:border-surface-700"
      :class="[collapsed ? 'flex justify-center' : 'flex justify-end']"
    >
      <Button variant="text" @click="toggleCollapse" class="w-8 h-8">
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['collapse'])

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const active = ref('Dashboard')

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
  { label: 'Order', icon: 'pi pi-shopping-cart', path: '/order/viettelpost' },
  { label: 'Ticket', icon: 'pi pi-ticket', path: '/ticket' },
  { label: 'Address', icon: 'pi pi-map-marker', path: '/address' },
  { label: 'Setting', icon: 'pi pi-cog', path: '/setting' },
]

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const select = (item) => {
  active.value = item.label
  router.push(item.path)
}

watch(collapsed, () => {
  emit('collapse', collapsed.value)
})
onMounted(() => {
  active.value = menuItems.find(
    (item) => route.path.includes(item.path) || item.path.includes(route.path),
  ).label
})
</script>

<style scoped>
/* Smooth hide/show label */
span {
  transition: opacity 0.2s ease;
}
</style>
