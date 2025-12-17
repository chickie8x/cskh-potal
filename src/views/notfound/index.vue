<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
    <i class="pi pi-exclamation-triangle text-yellow-500 text-6xl"></i>

    <h1 class="text-3xl font-bold">404 - Page Not Found</h1>

    <p class="text-gray-600">The page you're looking for doesn't exist.</p>

    <Button label="Go Home" icon="pi pi-home" @click="goHome" class="mt-3" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Dashboard' })
}
</script>
