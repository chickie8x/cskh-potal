<template>
  <Card class="w-full mt-4">
    <template #content>
      <div>
        <h2>Phương thức chuyển đổi</h2>
        <div class="flex items-center gap-8 py-4">
          <div class="flex items-center gap-1">
            <RadioButton v-model="converMethod" value="oldToNew" size="small" />
            <label class="text-sm font-medium">Cũ sang mới</label>
          </div>
          <div class="flex items-center gap-1">
            <RadioButton v-model="converMethod" value="newToOld" size="small" />
            <label class="text-sm font-medium">Mới sang cũ</label>
          </div>
        </div>
      </div>
      <Form
        v-if="converMethod === 'oldToNew'"
        v-slot="$form"
        :initialValues="{ province: '', district: '', ward: '', address: '' }"
        :resolver="resolver"
        @submit="onFormSubmit"
        class="grid grid-cols-3 gap-x-2 gap-y-4"
      >
        <div class="flex flex-col gap-1 col-span-1">
          <label class="text-sm font-medium">Tỉnh/Thành phố</label>
          <Select
            name="province"
            @change="fetchDistricts($form.province.value)"
            :options="provinces"
            optionLabel="PROVINCE_NAME"
            optionValue="PROVINCE_NAME"
            size="small"
          />
        </div>
        <div class="flex flex-col gap-1 col-span-1">
          <label class="text-sm font-medium">Quận/Huyện</label>
          <Select
            name="district"
            @change="fetchWards($form.district.value)"
            :options="districts"
            optionLabel="DISTRICT_NAME"
            optionValue="DISTRICT_NAME"
            size="small"
          />
        </div>
        <div class="flex flex-col gap-1 col-span-1">
          <label class="text-sm font-medium">Phường/Xã</label>
          <Select
            name="ward"
            :options="wards"
            optionLabel="WARDS_NAME"
            optionValue="WARDS_NAME"
            size="small"
          />
        </div>
        <div class="flex flex-col gap-1 col-span-3">
          <label class="text-sm font-medium">Địa chỉ</label>
          <InputText name="address" size="small" />
        </div>
        <Button
          type="submit"
          label="Chuyển đổi"
          icon="pi pi-check"
          :loading="loading"
          size="small"
        />
      </Form>

      <Form
        v-if="converMethod === 'newToOld'"
        v-slot="$form"
        :initialValues="{ province: '', ward: '', address: '' }"
        :resolver="resolver"
        @submit="onFormSubmit"
        class="grid grid-cols-2 gap-x-2 gap-y-4"
      >
        <div class="flex flex-col gap-1 col-span-1">
          <label class="text-sm font-medium">Tỉnh/Thành phố</label>
          <Select
            name="province"
            @change="fetchWardsNew($form.province.value)"
            :options="provinces"
            optionLabel="PROVINCE_NAME"
            optionValue="PROVINCE_NAME"
            size="small"
          />
        </div>
        <div class="flex flex-col gap-1 col-span-1">
          <label class="text-sm font-medium">Phường/Xã</label>
          <Select
            name="ward"
            :options="wards"
            optionLabel="WARDS_NAME"
            optionValue="WARDS_NAME"
            size="small"
          />
        </div>
        <div class="flex flex-col gap-1 col-span-3">
          <label class="text-sm font-medium">Địa chỉ</label>
          <InputText name="address" size="small" />
        </div>
        <Button
          type="submit"
          label="Chuyển đổi"
          icon="pi pi-check"
          :loading="loading"
          size="small"
        />
      </Form>
    </template>
  </Card>
  <Card v-if="convertedAddress && isDone" class="mt-4 p-4 bg-green-200 result-card-success">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-check-circle text-green-900" />
        <h2 class="text-green-900 font-bold text-xl">Kết quả</h2>
      </div>
    </template>
    <template #content>
      <div class="flex items-center text-sm">
        <span class="font-bold block w-32">Địa chỉ gốc:</span>
        <span class="capitalize">{{ originalAddress }}</span>
      </div>
      <div class="flex items-center text-sm mt-2">
        <span class="font-bold block w-32">Địa chỉ chuyển đổi:</span>
        <span class="capitalize">{{ convertedAddress }}</span>
      </div>
    </template>
  </Card>

  <Card v-if="!convertedAddress && isDone" class="mt-4 p-4 result-card-failure">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-times-circle text-red-900" />
        <h2 class="text-red-900 font-bold text-xl">Kết quả</h2>
      </div>
    </template>
    <template #content>
      <div class="flex items-center text-sm">
        <Message severity="error" icon="pi pi-ban" size="small">Đã có lỗi xảy ra</Message>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Card, InputText, Select, Button, RadioButton, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

const provinces = ref([])
const districts = ref([])
const wards = ref([])
const converMethod = ref('oldToNew')
const loading = ref(false)
const isDone = ref(false)

const originalAddress = ref(null)
const convertedAddress = ref(null)
const resetResult = () => {
  originalAddress.value = null
  convertedAddress.value = null
  isDone.value = false
}

const fetchProvinces = async () => {
  try {
    const response = await api.get('/connector/viettelpost/provinces')
    if (response.data.success) {
      provinces.value = response.data.data.data
    } else {
      toast.error(response.data.message || 'Lỗi khi lấy tỉnh/thành phố')
    }
  } catch (error) {
    toast.error('Lỗi khi lấy tỉnh/thành phố')
    console.error(error)
  }
}

const fetchDistricts = async (provinceName) => {
  resetResult()
  const provinceId = provinces.value.find(
    (province) => province.PROVINCE_NAME === provinceName,
  )?.PROVINCE_ID
  if (!provinceId) {
    toast.error('Không tìm thấy Id tỉnh')
    return
  }
  try {
    const response = await api.get(`/connector/viettelpost/districts`, {
      params: {
        provinceId,
      },
    })
    if (response.data.success) {
      districts.value = response.data.data.data
    } else {
      toast.error(response.data.message || 'Lỗi khi lấy quận/huyện')
    }
  } catch (error) {
    toast.error('Lỗi khi lấy quận/huyện')
    console.error(error)
  }
}

const fetchWards = async (districtName) => {
  resetResult()
  const districtId = districts.value.find(
    (district) => district.DISTRICT_NAME === districtName,
  )?.DISTRICT_ID
  if (!districtId) {
    toast.error('Không tìm thấy Id quận')
    return
  }
  try {
    const response = await api.get(`/connector/viettelpost/wards`, {
      params: {
        districtId,
      },
    })
    if (response.data.success) {
      wards.value = response.data.data.data
    } else {
      toast.error(response.data.message || 'Lỗi khi lấy phường/xã')
    }
  } catch (error) {
    toast.error('Lỗi khi lấy phường/xã')
    console.error(error)
  }
}

const fetchWardsNew = async (provinceName) => {
  resetResult()
  const provinceId = provinces.value.find(
    (province) => province.PROVINCE_NAME === provinceName,
  )?.PROVINCE_ID
  if (!provinceId) {
    toast.error('Không tìm thấy Id tỉnh')
    return
  }
  try {
    const response = await api.get(`/connector/viettelpost/wards-new`, {
      params: {
        provinceId,
      },
    })
    if (response.data.success) {
      wards.value = response.data.data.data
    } else {
      toast.error(response.data.message || 'Lỗi khi lấy phường/xã')
    }
  } catch (error) {
    toast.error('Lỗi khi lấy phường/xã')
    console.error(error)
  }
}

const oldToNewSchema = z.object({
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  address: z.string().min(1),
})

const newToOldSchema = z.object({
  province: z.string().min(1),
  ward: z.string().min(1),
  address: z.string().min(1),
})

const resolver = computed(() =>
  converMethod.value === 'oldToNew' ? zodResolver(oldToNewSchema) : zodResolver(newToOldSchema),
)

const onFormSubmit = async ($form) => {
  if (!$form.valid) {
    toast.error('Vui lòng nhập đầy đủ thông tin')
    return
  }
  loading.value = true
  let payload = ''
  if (converMethod.value === 'oldToNew') {
    payload = `${$form.values.address}, ${$form.values.ward}, ${$form.values.district}, ${$form.values.province}`
  } else {
    payload = `${$form.values.address}, ${$form.values.ward}, ${$form.values.province}`
  }
  try {
    const response = await api.post('/connector/viettelpost/checking-address', { address: payload })
    if (response.data.success) {
      convertedAddress.value = response.data.data.reference.formattedAddress
      originalAddress.value = payload
      isDone.value = true
    } else {
      isDone.value = true
    }
    loading.value = false
  } catch (error) {
    console.error(error)
    loading.value = false
    isDone.value = true
  }
}

onMounted(() => {
  fetchProvinces()
})
</script>

<style scoped>
.result-card-success {
  background-color: var(--p-emerald-50) !important;
  --p-card-color: var(--p-emerald-700) !important;
  border: solid 1px var(--p-emerald-400) !important;
}

.result-card-failure {
  background-color: var(--p-red-50) !important;
  --p-card-color: var(--p-red-700) !important;
  border: solid 1px var(--p-red-400) !important;
}
</style>
