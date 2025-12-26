<template>
  <div class="flex items-center justify-center">
    <Form
      v-slot="$form"
      :initialValues="{ province: '', district: '', ward: '', address: '' }"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="w-full flex flex-col gap-4"
    >
      <div>
        <IconField>
          <InputIcon class="pi pi-warehouse" />
          <InputText
            name="addressName"
            :placeholder="t('addressName')"
            class="w-full"
            size="small"
          />
        </IconField>
        <Message v-if="$form.addressName?.invalid" severity="error" size="small" variant="simple">{{
          $form.addressName.error?.message
        }}</Message>
      </div>
      <div>
        <IconField>
          <InputIcon class="pi pi-phone" />
          <InputText
            name="addressPhone"
            :placeholder="t('addressPhone')"
            class="w-full"
            size="small"
          />
        </IconField>
        <Message
          v-if="$form.addressPhone?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $form.addressPhone.error?.message }}</Message
        >
      </div>
      <div>
        <IconField>
          <InputIcon class="pi pi-hashtag" />
          <InputText name="addressTag" :placeholder="t('addressTag')" class="w-full" size="small" />
        </IconField>
        <Message v-if="$form.addressTag?.invalid" severity="error" size="small" variant="simple">{{
          $form.addressTag.error?.message
        }}</Message>
      </div>
      <div>
        <Select
          name="province"
          optionLabel="PROVINCE_NAME"
          optionValue="PROVINCE_NAME"
          :options="provinces"
          :placeholder="t('province')"
          @change="fetchDistricts($form.province.value)"
          class="min-w-64 w-full"
          size="small"
        />
        <Message v-if="$form.province?.invalid" severity="error" size="small" variant="simple">{{
          $form.province.error?.message
        }}</Message>
      </div>
      <div>
        <Select
          name="district"
          optionLabel="DISTRICT_NAME"
          optionValue="DISTRICT_NAME"
          :options="districts"
          :placeholder="t('district')"
          @change="fetchWards($form.district.value)"
          class="min-w-64 w-full"
          size="small"
        />
        <Message v-if="$form.district?.invalid" severity="error" size="small" variant="simple">{{
          $form.district.error?.message
        }}</Message>
      </div>
      <div>
        <Select
          name="ward"
          optionLabel="WARDS_NAME"
          optionValue="WARDS_NAME"
          :options="wards"
          :placeholder="t('ward')"
          class="min-w-64 w-full"
          size="small"
        />
        <Message v-if="$form.ward?.invalid" severity="error" size="small" variant="simple">{{
          $form.ward.error?.message
        }}</Message>
      </div>
      <div>
        <InputText
          name="address"
          :placeholder="t('address')"
          class="min-w-64 w-full"
          size="small"
        />
        <Message v-if="$form.address?.invalid" severity="error" size="small" variant="simple">{{
          $form.address.error?.message
        }}</Message>
      </div>
      <Button type="submit" label="Thêm" class="w-full" />
    </Form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Select, InputText, Button, Message, InputIcon, IconField } from 'primevue'
import { Form } from '@primevue/forms'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const provinces = ref([])
const districts = ref([])
const wards = ref([])

const emits = defineEmits(['addressAdd'])

const resolver = ref(
  zodResolver(
    z.object({
      addressName: z.string().min(1, 'Tên kho/ Nhân viên is required'),
      addressPhone: z.string().min(1, 'Số điện thoại kho/ Nhân viên is required'),
      addressTag: z.string().min(1, 'Nhãn is required'),
      province: z.string().min(1, 'Tỉnh/Thành phố is required'),
      district: z.string().min(1, 'Quận/Huyện is required'),
      ward: z.string().min(1, 'Phường/Xã is required'),
      address: z.string().min(1, 'Địa chỉ is required'),
    }),
  ),
)
const fetchProvinces = async () => {
  try {
    const response = await api.get('/connector/viettelpost/provinces')
    if (!response.data.data.error) {
      provinces.value = response.data.data.data
    } else {
      toast.error(response.data.data.message || 'Lỗi khi lấy tỉnh/thành phố')
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchDistricts = async (provinceName) => {
  const provinceId = provinces.value.find(
    (province) => province.PROVINCE_NAME === provinceName,
  )?.PROVINCE_ID
  if (!provinceId) {
    toast.error('Không tìm thấy Id tỉnh')
    return
  }
  try {
    const response = await api.get('/connector/viettelpost/districts', {
      params: {
        provinceId,
      },
    })
    if (!response.data.data.error) {
      districts.value = response.data.data.data
    } else {
      toast.error(response.data.data.message || 'Lỗi khi lấy quận/huyện')
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchWards = async (districtName) => {
  const districtId = districts.value.find(
    (district) => district.DISTRICT_NAME === districtName,
  )?.DISTRICT_ID
  if (!districtId) {
    toast.error('Không tìm thấy Id quận')
    return
  }
  try {
    const response = await api.get('/connector/viettelpost/wards', {
      params: {
        districtId,
      },
    })
    if (!response.data.data.error) {
      wards.value = response.data.data.data
    } else {
      toast.error(response.data.data.message || 'Lỗi khi lấy phường/xã')
    }
  } catch (error) {
    console.error(error)
  }
}

const onFormSubmit = async ($form) => {
  if (!$form.valid) {
    toast.error('Vui lòng nhập đầy đủ thông tin')
    return
  }
  const data = {}
  const address = `${$form.values.address}, ${$form.values.ward}, ${$form.values.district}, ${$form.values.province}`
  data.address = address
  data.addressName = $form.values.addressName
  data.addressPhone = $form.values.addressPhone
  data.addressTag = $form.values.addressTag
  try {
    const response = await api.post('/customer/address', data)
    if (response.data.success) {
      toast.success('Thêm địa chỉ thành công')
      emits('addressAdd')
    } else {
      toast.error(response.data.message || 'Lỗi khi thêm địa chỉ')
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchProvinces()
})
</script>
