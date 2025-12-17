<template>
  <div class="h-full overflow-auto p-4">
    <div class="flex items-center justify-between gap-4">
      <span class="text-xl font-bold text-color">Tạo đơn</span>
      <div class="flex items-center gap-2">
        <span class="text-color font-bold text-sm">Đối tác</span>
        <Select
          v-model="code"
          :options="carrierOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          checkmark
          class="min-w-40"
          @change="onPartnerChange"
        />
      </div>
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Select } from 'primevue'
import { useRouter } from 'vue-router'

const router = useRouter()

const code = ref('VIETTEL_POST')
const carrierOptions = [
  { label: 'Viettel Post', value: 'VIETTEL_POST', path: '/order/viettelpost' },
  { label: 'Yunda Express', value: 'YUNDA_EXPRESS', path: '/order/yunda' },
]

const onPartnerChange = () => {
  const path = carrierOptions.find((option) => option.value === code.value)
  router.push(path.path)
}

onMounted(() => {
  const path = carrierOptions.find((option) => option.value === code.value)
  router.push(path.path)
})
</script>
