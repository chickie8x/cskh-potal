<template>
  <nav
    class="w-full flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700"
  >
    <!-- LEFT: Logo + Text -->
    <div class="flex items-center gap-2">
      <!-- <img src="/logo.png" alt="Logo" class="w-8 h-8" /> -->
      <span class="text-xl font-semibold">My App</span>
    </div>

    <!-- RIGHT: Actions -->
    <div class="flex items-center gap-8">
      <!-- Language Select -->
      <Select
        v-model="language"
        :options="languages"
        optionLabel="label"
        optionValue="value"
        class="w-32"
      />

      <!-- Dark Mode Toggle -->
      <ThemeSwitch />

      <!-- Notification -->
      <Notification />

      <!-- User Menu -->
      <div class="flex items-center">
        <User />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import Select from 'primevue/select'
import ThemeSwitch from '@/components/kits/themes/index.vue'
import Notification from '@/components/kits/notification/index.vue'
import User from '@/components/kits/user/index.vue'
import { useAuthStore } from '@/store/authstore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Language Select
const language = ref('vn')
const languages = [
  { label: '🇻🇳 VN', value: 'vn' },
  { label: '🇨🇳 中文', value: 'zh' },
]

// User Menu
const userMenuRef = ref()
const userItems = [
  { label: 'Profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Logout', icon: 'pi pi-sign-out', command: () => logout() },
]

const toggleUserMenu = (event) => {
  userMenuRef.value.toggle(event)
}

const logout = () => {
  authStore.clear()
  router.push('/login')
}
</script>
