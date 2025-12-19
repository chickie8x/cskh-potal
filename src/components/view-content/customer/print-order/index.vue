<template>
  <div class="p-4 text-color bg-surface-50 h-screen">
    <span class="text-2xl text-color font-bold">In vận đơn</span>
    <div class="mt-4 flex gap-4">
      <Card class="w-1/2">
        <template #title>
          <span class="font-medium text-primary">Tùy chọn</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-1">
              <Checkbox v-model="showPostage" binary id="showPostage" size="small" />
              <label for="showPostage" class="mt-1 text-sm font-medium">Hiển thị cước phí</label>
            </div>
            <div class="flex flex-col">
              <label for="printSize" class="text-sm font-medium">Kích cỡ in</label>
              <Select
                v-model="selectedSize"
                :options="printSizes"
                optionLabel="label"
                optionValue="value"
                checkmark
                placeholder="Chọn kích cỡ in"
                size="small"
                class="w-40"
                id="printSize"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card class="w-1/2">
        <template #title>
          <span class="font-medium text-primary">Chi tiết</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="block min-w-18">Mã vận đơn:</span>
              <span class="font-bold">{{ orderCode }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="block min-w-18">Đối tác:</span>
              <span class="font-bold">{{ carriers[carrier] }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Button
                @click="onPrint"
                label="In vận đơn"
                icon="pi pi-print"
                :loading="loading"
                size="small"
                class="w-32"
              />
              <Button
                label="Home"
                icon="pi pi-home"
                size="small"
                @click="router.push('/')"
                class="w-32"
                variant="outlined"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Select, Checkbox, Card } from 'primevue'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const carrier = route.params.partner
const orderCode = route.query.ordercode
const showPostage = ref(false)
const loading = ref(false)
const printSizes = [
  {
    value: '1',
    label: 'Nhãn A5',
  },
  {
    value: '2',
    label: 'Nhãn A6',
  },
  {
    value: '100',
    label: 'Nhãn A7',
  },
]

const carriers = {
  viettelpost: 'Viettel Post',
  yunda: 'Yunda Express',
}
const selectedSize = ref(printSizes[0].value)

const onPrint = async () => {
  try {
    loading.value = true
    const expiryTime = new Date().getTime() + 60 * 60 * 1000
    const orderArray = [orderCode]
    const response = await api.post('connector/viettelpost/order/print', { expiryTime, orderArray })
    console.log(response.data)
    const URL = `https://digitalize.viettelpost.vn/DigitalizePrint/report.do?type=${selectedSize.value}&bill=${response.data.data.message}&showPostage=${showPostage.value ? 1 : 0}`
    window.open(URL, '_blank')
  } catch (err) {
    console.log(err)
    toast.error('Lấy code in mã đơn thất bại')
  } finally {
    loading.value = false
  }
}
</script>
