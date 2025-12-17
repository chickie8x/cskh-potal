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
      <div class="w-64 max-h-80 overflow-y-auto">
        <template v-if="notifications.length">
          <div
            v-for="(item, index) in notifications"
            :key="index"
            class="flex items-start gap-2 p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            @click="markAsRead(item)"
          >
            <i :class="item.icon" class="text-lg mt-1"></i>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ item.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.time }}</p>
            </div>
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
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Popover from 'primevue/popover'

// Popover ref
const popoverRef = ref()

// Dummy notifications
const notifications = ref([
  { title: 'New order received', time: '2 min ago', icon: 'pi pi-shopping-cart', read: false },
  { title: 'Server rebooted', time: '10 min ago', icon: 'pi pi-server', read: false },
  { title: 'New message from John', time: '1 hour ago', icon: 'pi pi-envelope', read: true },
])

// Unread count
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

// Toggle popover
const togglePopover = (event) => {
  popoverRef.value.toggle(event)
}

// Mark as read
const markAsRead = (item) => {
  item.read = true
}
</script>

<style scoped>
/* Badge positioning */
.pi-badge {
  transform: translate(50%, -50%);
}
</style>
