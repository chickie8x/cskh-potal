<template>
  <div class="h-full overflow-auto p-4">
    <div class="flex items-center justify-between gap-4">
      <span class="text-xl font-bold text-color">{{ t('createOrder') }}</span>
      <div class="flex items-center gap-2">
        <span class="text-color font-bold text-sm">{{ t('carrier') }}</span>
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
import { ref, onMounted, watch } from 'vue'
import { Select } from 'primevue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const code = ref('VIETTEL_POST')
const carrierOptions = [
  { label: 'Viettel Post', value: 'VIETTEL_POST', path: '/order/viettelpost' },
  { label: 'Yunda Express', value: 'YUNDA_EXPRESS', path: '/order/yunda' },
]

const updateCarrierFromRoute = () => {
  const currentPath = route.path
  const carrier = carrierOptions.find((option) =>
    currentPath.includes(option.path.split('/').pop()),
  )
  if (carrier && carrier.value !== code.value) {
    code.value = carrier.value
  }
}

const onPartnerChange = () => {
  const path = carrierOptions.find((option) => option.value === code.value)
  router.push(path.path)
}

onMounted(() => {
  updateCarrierFromRoute()
})

watch(() => route.path, updateCarrierFromRoute)
</script>
