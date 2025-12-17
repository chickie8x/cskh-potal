<template>
  <div class="flex items-center">
    <Menu ref="userMenuRef" :model="userItems" popup @item-click="userItems?.command" />
    <Button
      icon="pi pi-user"
      variant="text"
      class="userBtnNavbar"
      rounded
      @click="toggleUserMenu"
      :label="user"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/authstore'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// User menu reference
const userMenuRef = ref()

// User menu items
const userItems = [
  { label: 'Profile', icon: 'pi pi-user' },
  { label: 'Settings', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Logout', icon: 'pi pi-sign-out', command: () => logout() },
]

const toggleUserMenu = (event) => {
  userMenuRef.value.toggle(event)
}
const user = authStore.user?.name || 'User'

const logout = () => {
  authStore.clear()
  router.push('/login')
}

const command = (item) => {
  if (item.item.command) {
    item.item.command()
  }
}
</script>

<style scoped>
.userBtnNavbar {
  font-size: 0.9rem;
}
</style>
