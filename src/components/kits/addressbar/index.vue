<template>
  <div
    class="flex items-center gap-1 p-2 border-b border-surface-200 dark:border-surface-700 hover:bg-primary-50"
  >
    <i class="pi pi-map-marker text-primary" />
    <span class="text-sm block w-full">{{ address }}</span>
    <div class="flex items-center justify-end gap-2">
      <Button
        v-tooltip.focus.top="'Đã sao chép'"
        size="small"
        icon="pi pi-clone"
        variant="outlined"
        rounded
        severity="help"
        @click="copyAddress"
      />
      <Button
        size="small"
        icon="pi pi-trash"
        variant="outlined"
        rounded
        severity="danger"
        @click="deleteAddress"
      />
    </div>
  </div>
</template>

<script setup>
import { Button } from 'primevue'
import { ref } from 'vue'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
const props = defineProps({
  address: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['deleteAddress'])

const address = ref(props.address.address)
const addressId = ref(props.address.id)
const copyAddress = () => {
  navigator.clipboard.writeText(address.value)
}
const deleteAddress = async () => {
  try {
    const response = await api.delete(`/customer/address`, { data: { id: addressId.value } })
    if (response.data.success) {
      toast.success('Xóa địa chỉ thành công')
      emits('deleteAddress')
    }
  } catch (error) {
    console.error(error)
    toast.error('Xóa địa chỉ thất bại')
  }
}
</script>
