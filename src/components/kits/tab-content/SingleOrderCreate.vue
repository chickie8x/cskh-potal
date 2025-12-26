<template>
  <Form
    ref="formRef"
    v-slot="$form"
    :initialValues="{
      SENDER_FULLNAME: senderAddr.addressName,
      SENDER_PHONE: senderAddr.addressPhone,
      SENDER_ADDRESS: senderAddr.address,
      RECEIVER_FULLNAME: '',
      RECEIVER_PHONE: '',
      RECEIVER_PROVINCE: '',
      RECEIVER_DISTRICT: '',
      RECEIVER_WARD: '',
      RECEIVER_ADDR: '',
      RECEIVER_ADDRESS: '',
      PRODUCT_TYPE: 'HH',
      PRODUCT_PRICE: 0,
      PRODUCT_WEIGHT: 0,
      PRODUCT_LENGTH: 1,
      PRODUCT_WIDTH: 1,
      PRODUCT_HEIGHT: 1,
      ORDER_PAYMENT: null,
      MONEY_COLLECTION: undefined,
      ORDER_SERVICE: null,
      ORDER_NOTE: '',
      WHO_PAY: 'senderPay',
    }"
    :resolver="resolver"
    class="relative"
    @submit="onFormSubmit"
  >
    <div class="flex gap-8 pb-4">
      <div class="flex flex-col gap-4 w-3/5">
        <Card>
          <template #title>
            <div class="flex items-center gap-1">
              <i class="pi pi-user size-5" />
              <span class="text-sm text-color font-bold">{{ t('sender') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <IconField>
                <InputIcon class="pi pi-user" />
                <InputText name="SENDER_FULLNAME" class="w-full" size="small" readonly />
              </IconField>

              <IconField>
                <InputIcon class="pi pi-phone" />
                <InputText name="SENDER_PHONE" class="w-full" size="small" readonly />
              </IconField>
              <Select
                name="SENDER_ADDRESS"
                :options="senderAddresses"
                optionValue="address"
                optionLabel="address"
                class="w-full"
                size="small"
                checkmark
                @change="onSenderAdressChange($form, $event)"
              >
                <template #option="slotProps">
                  <div class="flex flex-col gap-2 py-2">
                    <div class="flex items-center gap-8">
                      <span class="text-sm font-semibold text-color"
                        ><i class="pi pi-warehouse size-4 mr-1" />{{
                          slotProps.option.addressName
                        }}</span
                      >
                      <span class="text-sm font-semibold text-color"
                        ><i class="pi pi-phone size-4 mr-1" />{{
                          slotProps.option.addressPhone
                        }}</span
                      >
                    </div>
                    <span class="text-sm text-color"
                      ><i class="pi pi-map-marker size-4 mr-1" />{{
                        slotProps.option.address
                      }}</span
                    >
                  </div>
                </template>
              </Select>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-1">
              <i class="pi pi-user size-5" />
              <span class="text-sm text-color font-bold">{{ t('receiver') }}</span>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2">
                <IconField class="w-full">
                  <InputIcon class="pi pi-user" />
                  <InputText
                    name="RECEIVER_FULLNAME"
                    :placeholder="t('receiverName')"
                    class="w-full"
                    size="small"
                  />
                </IconField>
                <IconField class="w-full">
                  <InputIcon class="pi pi-phone" />
                  <InputText
                    name="RECEIVER_PHONE"
                    :placeholder="t('receiverPhone')"
                    class="w-full"
                    size="small"
                  />
                </IconField>
              </div>
              <div class="flex items-center gap-2">
                <Select
                  name="RECEIVER_PROVINCE"
                  :options="provinces"
                  optionValue="PROVINCE_NAME"
                  optionLabel="PROVINCE_NAME"
                  :placeholder="t('receiverProvince')"
                  class="w-full"
                  size="small"
                  @change="fetchDistricts($form.RECEIVER_PROVINCE.value)"
                  filter
                />
                <Select
                  name="RECEIVER_DISTRICT"
                  :options="districts"
                  optionValue="DISTRICT_NAME"
                  optionLabel="DISTRICT_NAME"
                  :placeholder="t('receiverDistrict')"
                  class="w-full"
                  size="small"
                  @change="fetchWards($form.RECEIVER_DISTRICT.value)"
                  filter
                />
                <Select
                  name="RECEIVER_WARD"
                  :options="wards"
                  optionValue="WARDS_NAME"
                  optionLabel="WARDS_NAME"
                  :placeholder="t('receiverWard')"
                  class="w-full"
                  size="small"
                  filter
                />
              </div>
              <FloatLabel variant="on">
                <InputText name="RECEIVER_ADDR" class="w-full" size="small" />
                <label for="RECEIVER_ADDR">Địa chỉ</label>
              </FloatLabel>
              <InputText name="RECEIVER_ADDRESS" class="hidden" />
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-1">
              <i class="pi pi-truck"></i>
              <span class="text-sm text-color font-bold">{{ t('service') }}</span>
            </div>
          </template>

          <template #content>
            <RadioButtonGroup name="ORDER_SERVICE" @change="onServiceChange">
              <div class="grid grid-cols-3 gap-8 text-sm text-color">
                <div
                  v-for="service in mainServices"
                  :key="service.MA_DV_CHINH"
                  class="flex items-center gap-2"
                >
                  <RadioButton
                    :id="service.MA_DV_CHINH"
                    :value="service.MA_DV_CHINH"
                    size="small"
                  />
                  <label :for="service.MA_DV_CHINH">{{ service.TEN_DICHVU }}</label>
                </div>
              </div>
            </RadioButtonGroup>
            <div
              v-if="selectedService"
              class="mt-4 border-t border-surface flex items-center gap-12 pt-4 text-sm text-color"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium"> Mã dịch vụ: </span>
                <span class="font-bold text-red-500">
                  {{ selectedService?.MA_DV_CHINH }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium"> Giá cước: </span>
                <span class="font-bold text-red-500">
                  {{ selectedService?.GIA_CUOC ? formatCurrency(selectedService?.GIA_CUOC) : null }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium"> Thời gian dự kiến: </span>
                <span class="font-bold text-red-500">
                  {{ selectedService?.THOI_GIAN || null }}
                </span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="flex flex-col gap-4 w-2/5">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-shopping-cart"></i>
              <span class="text-sm text-color font-bold">{{ t('productInfo') }}</span>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2 mt-4">
                <span class="text-sm text-color font-medium">{{ t('productType') }}</span>
                <RadioButtonGroup name="PRODUCT_TYPE" class="flex items-center gap-12">
                  <div class="flex items-center gap-2">
                    <RadioButton value="HH" inputId="typeHH" size="small" checked />
                    <label for="typeHH" class="text-sm text-color">{{ t('package') }}</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <RadioButton value="TH" inputId="typeTH" size="small" />
                    <label for="typeTH" class="text-sm text-color">{{ t('document') }}</label>
                  </div>
                </RadioButtonGroup>
              </div>
              <div
                class="mt-2 border-t border-surface py-4 flex flex-col divide-y divide-dashed divide-surface-300"
              >
                <div v-for="(prod, idx) in productDetail" :key="idx" class="py-4">
                  <div class="flex items-center gap-4">
                    <FloatLabel variant="on">
                      <InputText id="productName" v-model="prod.PRODUCT_NAME" size="small" fluid />
                      <label for="productName">{{ t('productName') }}</label>
                    </FloatLabel>
                    <Button
                      @click="removeProduct(idx)"
                      variant="outlined"
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                    />
                  </div>
                  <div class="flex items-center gap-2 mt-4">
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productQuantity"
                        v-model="prod.PRODUCT_QUANTITY"
                        size="small"
                        fluid
                        class="text-sm"
                        mode="decimal"
                        showButtons
                      />
                      <label for="productQuantity">{{ t('productQuantity') }}</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productWeight"
                        v-model="prod.PRODUCT_WEIGHT"
                        size="small"
                        fluid
                        class="text-sm"
                      />
                      <label for="productWeight">{{ t('productWeight') }}</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productPrice"
                        v-model="prod.PRODUCT_PRICE"
                        size="small"
                        fluid
                        class="text-sm"
                      />
                      <label for="productPrice">{{ t('productPrice') }}</label>
                    </FloatLabel>
                  </div>
                </div>
                <div class="flex items-center justify-end py-4">
                  <Button
                    @click="addProduct"
                    variant="outlined"
                    label="Thêm"
                    icon="pi pi-plus"
                    size="small"
                  />
                </div>
                <div class="py-4 flex flex-col gap-2">
                  <div class="flex items-center gap-1">
                    <i class="pi pi-info-circle size-5" />
                    <span class="text-sm text-color font-medium">{{ t('productSize') }}</span>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productLength"
                        name="PRODUCT_LENGTH"
                        size="small"
                        fluid
                        :format="false"
                      />
                      <label for="productLength">{{ t('productLength') }}</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productWidth"
                        name="PRODUCT_WIDTH"
                        size="small"
                        fluid
                        :format="false"
                      />
                      <label for="productWidth">{{ t('productWidth') }}</label>
                    </FloatLabel>
                    <FloatLabel variant="on">
                      <InputNumber
                        id="productHeight"
                        name="PRODUCT_HEIGHT"
                        size="small"
                        fluid
                        :format="false"
                      />
                      <label for="productHeight">{{ t('productHeight') }}</label>
                    </FloatLabel>
                  </div>
                </div>
                <div class="mt-4 border-t border-surface py-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-color">{{ t('totalWeight') }}</span>
                    <span class="text-sm font-semibold text-red-600"
                      >{{ formatNumber(totalWeight) }}g</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-color">{{ t('totalPrice') }}</span>
                    <span class="text-sm font-semibold text-red-600">{{
                      formatCurrency(totalPrice)
                    }}</span>
                  </div>
                  <InputNumber
                    id="productPrice"
                    name="PRODUCT_PRICE"
                    size="small"
                    class="hidden!"
                    readonly
                  />
                  <InputNumber
                    id="productWeight"
                    name="PRODUCT_WEIGHT"
                    size="small"
                    class="hidden!"
                    readonly
                  />
                  <InputNumber
                    id="orderPayment"
                    name="ORDER_PAYMENT"
                    size="small"
                    class="hidden!"
                    readonly
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-money-bill size-5" />
              <span class="text-color font-bold text-sm">{{ t('codMethod') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex items-center gap-2">
              <Checkbox v-model="isCod" id="isCod" name="isCod" size="small" binary />
              <label for="isCod" class="text-sm">{{ t('codByProductPrice') }}</label>
            </div>
            <InputNumber
              :modelValue="isCod ? totalPrice : 0"
              id="codAmount"
              name="MONEY_COLLECTION"
              size="small"
              fluid
              readonly
              suffix=" VNĐ"
              class="mt-2"
            />
            <div class="flex flex-col gap-2 mt-4">
              <span class="text-sm text-color font-medium">{{ t('whoPay') }}</span>
              <RadioButtonGroup name="WHO_PAY" class="flex items-center gap-8">
                <div class="flex items-center gap-1">
                  <RadioButton id="senderPay" value="senderPay" size="small" />
                  <label for="senderPay" class="text-sm">{{ t('sender') }}</label>
                </div>
                <div class="flex items-center gap-1">
                  <RadioButton id="receiverPay" value="receiverPay" size="small" />
                  <label for="receiverPay" class="text-sm">{{ t('receiver') }}</label>
                </div>
              </RadioButtonGroup>
            </div>
            <div class="mt-4">
              <FloatLabel variant="on">
                <Textarea name="ORDER_NOTE" fluid class="text-sm" />
                <label for="ORDER_NOTE">{{ t('note') }}</label>
              </FloatLabel>
            </div>
          </template>
        </Card>
      </div>
    </div>
    <FormWatcher :form="$form" @allFieldsHaveValue="getServices" />
    <Card class="myDock">
      <template #content>
        <div class="grid grid-cols-4 gap-2 text-sm text-color">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ t('totalFee') }}: </span>
            <span class="font-bold text-red-500">{{
              selectedService?.GIA_CUOC ? formatCurrency(selectedService?.GIA_CUOC) : 0
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ t('timeDiliver') }}: </span>
            <span class="font-bold text-red-500">{{ selectedService?.THOI_GIAN || 0 }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ t('codMoney') }}: </span>
            <span class="font-bold text-red-500">{{
              formRef?.states.MONEY_COLLECTION.value
                ? formatCurrency(formRef?.states.MONEY_COLLECTION.value)
                : 0
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Button type="submit" :label="t('createOrder')" icon="pi pi-check" size="small" />
            <Button
              variant="outlined"
              severity="info"
              :label="t('saveDraft')"
              icon="pi pi-file"
              size="small"
            />
          </div>
        </div>
      </template>
    </Card>
  </Form>
  <Dialog v-model:visible="visible" modal header="Tạo đơn thành công" style="width: 28rem">
    <div class="flex items-center justify-between gap-2">
      <Button
        @click="goToPrint"
        severity="success"
        :label="t('printOrder')"
        icon="pi pi-print"
        size="small"
        class="min-w-32"
      />
      <Button
        @click="goToHome"
        severity="info"
        variant="outlined"
        label="Về trang chủ"
        icon="pi pi-home"
        size="small"
        class="min-w-32"
      />
      <Button
        @click="stayOrderCreate"
        severity="secondary"
        variant="outlined"
        label="Tạo đơn mới"
        icon="pi pi-plus"
        size="small"
        class="min-w-32"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import {
  Card,
  Select,
  InputText,
  InputNumber,
  IconField,
  InputIcon,
  Button,
  RadioButtonGroup,
  RadioButton,
  FloatLabel,
  Checkbox,
  Textarea,
  Dialog,
} from 'primevue'
import { Form } from '@primevue/forms'
import FormWatcher from '@/components/kits/form-watcher/index.vue'
import { useAuthStore } from '@/store/authstore'
import { toast } from 'vue-sonner'
import api from '@/api/axios'
import { formatCurrency, formatNumber } from '@/utils/helpers'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const resolver = zodResolver(
  z.object({
    SENDER_ADDRESS: z.string().min(1, 'Địa chỉ người gửi là bắt buộc'),
    SENDER_FULLNAME: z.string().min(1, 'Tên người gửi là bắt buộc'),
    SENDER_PHONE: z.string().min(1, 'Số điện thoại người gửi là bắt buộc'),
    RECEIVER_FULLNAME: z.string().min(1, 'Tên người nhận là bắt buộc'),
    RECEIVER_PHONE: z.string().min(1, 'Số điện thoại người nhận là bắt buộc'),
    RECEIVER_ADDRESS: z.string().min(1, 'Địa chỉ người nhận là bắt buộc'),
    RECEIVER_WARD: z.string().min(1, 'Quận huyện người nhận là bắt buộc'),
    RECEIVER_DISTRICT: z.string().min(1, 'Quận huyện người nhận là bắt buộc'),
    RECEIVER_PROVINCE: z.string().min(1, 'Quận huyện người nhận là bắt buộc'),
    RECEIVER_ADDR: z.string().min(1, 'Địa chỉ người nhận là bắt buộc'),
    PRODUCT_TYPE: z.string().min(1),
    PRODUCT_PRICE: z.number(),
    PRODUCT_WEIGHT: z.number(),
    ORDER_SERVICE: z.string().min(1),
    ORDER_PAYMENT: z.number(),
    ORDER_NOTE: z.string().optional(),
    MONEY_COLLECTION: z.number().optional(),
  }),
)

const authstore = useAuthStore()
const formRef = ref(null)
const visible = ref(false)
const senderAddresses = authstore.userAddress
const senderAddr = ref(senderAddresses[0])
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const isCod = ref(false)
const mainServices = ref([])
const selectedService = ref(mainServices.value[0] || null)
const orderCreated = ref({})
const orderPayment = computed(() => {
  if (isCod.value) {
    if (formRef.value?.states.WHO_PAY.value === 'senderPay') {
      return 3
    } else {
      return 2
    }
  } else {
    if (formRef.value?.states.WHO_PAY.value === 'senderPay') {
      return 1
    } else {
      return 4
    }
  }
})
const productDetail = ref([
  {
    PRODUCT_NAME: '',
    PRODUCT_QUANTITY: 1,
    PRODUCT_WEIGHT: null,
    PRODUCT_PRICE: null,
  },
])

const totalWeight = computed(() => {
  return productDetail.value.reduce((total, item) => {
    const weight = Number(item.PRODUCT_WEIGHT)
    return total + (isNaN(weight) ? 0 : weight)
  }, 0)
})

const totalPrice = computed(() => {
  return productDetail.value.reduce((total, item) => {
    const price = Number(item.PRODUCT_PRICE)
    return total + (isNaN(price) ? 0 : price)
  }, 0)
})

const addProduct = () => {
  productDetail.value.push({
    PRODUCT_NAME: '',
    PRODUCT_QUANTITY: 1,
    PRODUCT_WEIGHT: null,
    PRODUCT_PRICE: null,
  })
}

const removeProduct = (idx) => {
  if (productDetail.value.length > 1) {
    productDetail.value.splice(idx, 1)
  } else {
    return
  }
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

watch(totalPrice, () => {
  formRef.value.setFieldValue('PRODUCT_PRICE', totalPrice.value)
})

watch(totalWeight, () => {
  formRef.value.setFieldValue('PRODUCT_WEIGHT', totalWeight.value)
})

watch(isCod, () => {
  formRef.value.setFieldValue('MONEY_COLLECTION', isCod.value ? totalPrice.value : undefined)
})

watch(orderPayment, () => {
  formRef.value.setFieldValue('ORDER_PAYMENT', orderPayment.value)
})

const getServices = async (obj) => {
  try {
    const res = await api.post('/connector/viettelpost/price-all-nlp', { data: obj })
    if (res.data.success) {
      mainServices.value = res.data.data.RESULT
      selectedService.value = mainServices.value[0]
      formRef.value.setFieldValue('ORDER_SERVICE', selectedService.value.MA_DV_CHINH)
      formRef.value.setFieldValue('RECEIVER_ADDRESS', res.data.data.RECEIVER_ADDRESS.ADDRESS)
    }
  } catch (error) {
    console.error(error)
  }
}

const onServiceChange = (e) => {
  selectedService.value = mainServices.value.find(
    (service) => service.MA_DV_CHINH === e.target.value,
  )
}

const orderFields = [
  'SENDER_FULLNAME',
  'SENDER_ADDRESS',
  'SENDER_PHONE',
  'RECEIVER_FULLNAME',
  'RECEIVER_ADDRESS',
  'RECEIVER_PHONE',
  'PRODUCT_PRICE',
  'PRODUCT_WEIGHT',
  'PRODUCT_LENGTH',
  'PRODUCT_WIDTH',
  'PRODUCT_HEIGHT',
  'ORDER_PAYMENT',
  'ORDER_SERVICE',
  'PRODUCT_TYPE',
  'ORDER_SERVICE_ADD',
  'ORDER_NOTE',
  'MONEY_COLLECTION',
]

const onFormSubmit = async ($form) => {
  if (!$form.valid) {
    console.log($form.errors)
    toast.error('Thiếu hoặc sai thông tin')
    return
  }
  const objData = {}
  orderFields.map((f) => {
    objData[f] = $form.values[f]
  })
  objData['PRODUCT_DETAIL'] = productDetail.value
  const productName = productDetail.value.map((item) => item.PRODUCT_NAME).join(',')
  objData['PRODUCT_NAME'] = productName
  try {
    const res = await api.post('/connector/viettelpost/order/create-nlp', { data: objData })
    console.log(res.data)
    visible.value = true
    orderCreated.value = res.data.data
  } catch (error) {
    toast.error(error.response.data.message || 'Lỗi khi tạo đơn hàng')
    console.error(error)
  }
}

const goToPrint = () => {
  router.push(`/print-order/viettelpost?ordercode=${orderCreated.value.waybill}`)
}

const goToHome = () => {
  router.push('/')
}

const stayOrderCreate = () => {
  visible.value = false
}

const onSenderAdressChange = ($form, event) => {
  const selectedAddress = event.value
  const addressObj = senderAddresses.find((addr) => addr.address === selectedAddress)

  if (addressObj) {
    senderAddr.value = addressObj
    formRef.value.setFieldValue('SENDER_FULLNAME', addressObj.addressName)
    formRef.value.setFieldValue('SENDER_PHONE', addressObj.addressPhone)
  }
}

onMounted(() => {
  fetchProvinces()
})
</script>

<style scoped>
.p-floatlabel {
  font-size: 14px !important;
}

.p-textarea {
  font-size: 14px !important;
}

.myDock {
  position: sticky;
  bottom: 0;
  margin: 0 auto;
  background-color: var(--color-primary-50);
}
</style>
