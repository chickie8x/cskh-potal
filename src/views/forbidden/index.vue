<template>
  <div class="flex items-center justify-center h-full p-6">
    <Card class="max-w-md w-full text-center py-10">
      <template #title>
        <h2 class="text-2xl font-bold">Access Denied</h2>
      </template>
      <template #content>
        <div class="flex flex-col items-center gap-4">
          <i class="pi pi-lock text-5xl text-red-500"></i>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            You don't have permission to access this page.
          </p>

          <Button label="Go Back" icon="pi pi-arrow-left" class="mt-4" @click="goBack" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped></style>
