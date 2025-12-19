<template>
  <div>
    <!-- Notification Button -->
    <Button text rounded @click="togglePopover" class="relative h-10 w-10">
      <i class="pi pi-bell"></i>
      <span v-if="unreadCount > 0" class="absolute top-2 right-2 bg-red-500 rounded-full w-2 h-2">
      </span>
    </Button>

    <!-- Popover -->
    <Popover ref="popoverRef">
      <div class="w-80 max-h-80 overflow-y-auto">
        <template v-if="notifications.length">
          <div
            v-for="(item, index) in notifications"
            :key="index"
            class="flex flex-col gap-2 p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <span class="font-bold text-sm text-color">{{ item.title }}</span>
            <span class="text-sm">{{ item.message }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-auto">{{
              formatDateTime(item.createdAt)
            }}</span>
          </div>
        </template>
        <template v-else>
          <p class="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
        </template>
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import { useEventSource } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/store/authstore'
import api from '@/api/axios'
import { formatDateTime } from '@/utils/helpers'

const authStore = useAuthStore()

const popoverRef = ref()
const baseUrl = import.meta.env.VITE_API_BASE_URL
const userId = authStore.user?.id
const sseUrl = `${baseUrl}/sse/events/${userId}`

const notifications = ref([])

// Unread count
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

// Toggle popover
const togglePopover = (event) => {
  popoverRef.value.toggle(event)
}

const getNotifications = async () => {
  try {
    const res = await api.get('/notification/get')
    if (res.data.success) {
      notifications.value = res.data.data
    }
  } catch (error) {
    console.log(error)
    toast.error('Lỗi khi tải thông báo')
  }
}

const { status, data, close } = useEventSource(sseUrl, [], {
  autoReconnect: true,
  serializer: {
    read: (rawData) => JSON.parse(rawData),
  },
})

watch(data, (newData) => {
  if (newData) {
    getNotifications()
    toast.info(newData.title, {
      description: newData.message,
      duration: 5000,
    })
  }
})

onMounted(() => {
  getNotifications()
})
</script>

<style scoped>
/* Badge positioning */
.pi-badge {
  transform: translate(50%, -50%);
}
</style>
