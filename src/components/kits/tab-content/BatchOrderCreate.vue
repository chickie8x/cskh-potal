<template>
  <div class="text-sm text-color">
    <div class="flex items-end justify-between">
      <div class="flex items-center gap-1">
        <i class="pi pi-file-excel text-primary mb-1" />
        <span>File: </span>
        <span class="font-italic text-primary underline select-none">{{ fileName }}</span>
      </div>
      <div class="flex items-center justify-end gap-4">
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="onFileChange"
        />
        <Button icon="pi pi-upload" :label="t('upload')" size="small" @click="fileInput.click()" />
        <Button
          icon="pi pi-download"
          variant="outlined"
          severity="info"
          :label="t('downloadTemplate')"
          size="small"
          @click="downloadTemplate"
        />
      </div>
    </div>

    <Card class="mt-4">
      <template #title>
        <div class="flex items-center gap-1">
          <i class="pi pi-user size-5" />
          <span class="font-semibold text-color text-sm">{{ t('sender') }}</span>
        </div>
      </template>

      <template #content>
        <div class="flex items-center gap-2">
          <IconField>
            <InputIcon class="pi pi-address-book" />
            <InputText size="small" readonly :value="senderName" />
          </IconField>
          <IconField>
            <InputIcon class="pi pi-phone" />
            <InputText size="small" readonly :value="senderPhone" />
          </IconField>
          <Select
            :options="senderAddresses"
            optionLabel="address"
            v-model="senderAddress"
            size="small"
            fluid
            @change="console.log(senderAddress)"
          />
        </div>
      </template>
    </Card>

    <Card v-if="excelData.length" class="mt-4">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <i class="pi pi-list size-5 mt-1" />
            <span class="font-semibold text-color text-sm">{{ t('orderList') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              icon="pi pi-check"
              variant="outlined"
              severity="info"
              :label="t('confirm')"
              size="small"
              @click="fetchServices"
            />
            <Button
              v-if="isVerified"
              @click="batchOrderCreate"
              icon="pi pi-file-plus"
              size="small"
              :label="t('createOrder')"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div class="mb-2">
          <span class="text-xs text-orange-600"
            >{{ t('orderListExcelChangedHint') }}</span
          >
        </div>
        <DataTable
          :value="excelData"
          editMode="cell"
          @cell-edit-complete="onCellEditComplete"
          showGridlines
          scrollable
          scrollHeight="flex"
          size="small"
        >
          <Column
            frozen
            alignFrozen="left"
            field="STT"
            header="STT"
            style="min-width: 50px"
            class="frozen-column-emerald"
          >
            <template #body="slotProps">
              <div class="text-xs text-color">{{ slotProps.index }}</div>
            </template>
          </Column>
          <Column
            v-if="printShow"
            frozen
            alignFrozen="left"
            :header="t('printOrder')"
            style="min-width: 64px"
            class="frozen-column-emerald"
          >
            <template #body="slotProps">
              <Button
                v-if="createdOrders[slotProps.index]"
                icon="pi pi-print"
                size="small"
                @click="onPrintOrder(slotProps.index)"
              />
            </template>
          </Column>
          <Column
            frozen
            alignFrozen="left"
            field="Trạng thái"
            :header="t('status')"
            style="min-width: 120px"
            class="frozen-column-emerald"
          >
            <template #body="slotProps">
              <div
                v-if="isVerified"
                class="text-xs text-color"
                :class="[
                  orderState[slotProps.index]?.status === 'success'
                    ? 'text-primary-600'
                    : 'text-red-600',
                ]"
              >
                {{ orderState[slotProps.index].message }}
              </div>
              <div v-else class="text-xs text-color">Chưa xác nhận</div>
            </template>
          </Column>
          <Column
            v-if="!printShow"
            frozen
            alignFrozen="left"
            field="Dịch vụ"
            :header="t('service')"
            style="min-width: 250px; font-size: 12px"
            class="frozen-column-emerald"
          >
            <template #body="slotProps">
              <span>{{
                orderServices[slotProps.index]
                  ? `${orderServices[slotProps.index]['MA_DV_CHINH']} - ${orderServices[slotProps.index]['TEN_DICHVU']}`
                  : ''
              }}</span>
            </template>
            <template #editor="{ data, field, index }">
              <Select
                :options="orderServicesOptions[index]"
                optionValue="MA_DV_CHINH"
                optionLabel="TEN_DICHVU"
                placeholder="Chọn dịch vụ"
                size="small"
                fluid
                @update:modelValue="onServiceSelect(index, $event)"
              />
            </template>
          </Column>
          <Column
            v-if="!printShow"
            frozen
            alignFrozen="left"
            field="Giá cước"
            :header="t('totalFee')"
            style="min-width: 100px"
            class="frozen-column-emerald"
          >
            <template #body="slotProps">
              <div class="text-xs text-color">
                {{
                  orderServices[slotProps.index]
                    ? formatCurrency(orderServices[slotProps.index]['GIA_CUOC'])
                    : ''
                }}
              </div>
            </template>
          </Column>
          <Column
            v-for="col in Object.entries(fieldMapper)"
            :key="col[0]"
            :field="col[1]"
            :header="t(col[1])"
            :style="styleMapper[col[1]]"
          >
            <template #body="{ data, field }">
              <div class="text-xs text-color">{{ data[field] }}</div>
            </template>
            <template #editor="{ data, field }">
              <template
                v-if="
                  field === 'PRODUCT_QUANTITY' ||
                  field === 'PRODUCT_WEIGHT' ||
                  field === 'PRODUCT_PRICE' ||
                  field === 'MONEY_COLLECTION'
                "
              >
                <InputNumber v-model="data[field]" size="small" />
              </template>
              <template v-else-if="field === 'PAYMENT_OBJECT'">
                <Select
                  :options="paymentObjectOptions"
                  optionLabel="name"
                  optionValue="value"
                  v-model="data[field]"
                  size="small"
                />
              </template>
              <template v-else-if="field === 'PRODUCT_TYPE'">
                <Select
                  size="small"
                  :options="productTypeOptions"
                  optionLabel="name"
                  optionValue="value"
                  v-model="data[field]"
                />
              </template>
              <template v-else>
                <InputText v-model="data[field]" size="small" />
              </template>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Button,
  DataTable,
  Column,
  Card,
  Select,
  InputText,
  IconField,
  InputIcon,
  InputNumber,
} from 'primevue'
import * as XLSX from 'xlsx'
import { useAuthStore } from '@/store/authstore'
import { toast } from 'vue-sonner'
import { chunkArray, formatCurrency } from '@/utils/helpers'
import api from '@/api/axios'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const senderAddresses = ref(authStore.userAddress)
const senderAddress = ref(senderAddresses.value[0])
const senderName = ref(authStore.user?.name)
const senderPhone = ref(authStore.user?.phone)
const orderServicesOptions = ref([])
const orderServices = ref([])
const orderState = ref([])
const isVerified = ref(false)
const createdOrders = ref([])
const printShow = ref(false)

const fieldMapper = {
  'Tên người nhận (*)': 'RECEIVER_FULLNAME',
  'Số ĐT người nhận (*)': 'RECEIVER_PHONE',
  'Địa chỉ nhận (*)': 'RECEIVER_ADDRESS',
  'Tên hàng hóa (*)': 'PRODUCT_NAME',
  'Số lượng': 'PRODUCT_QUANTITY',
  'Trọng lượng (gram)  (*)': 'PRODUCT_WEIGHT',
  'Dài (cm)': 'PRODUCT_LENGTH',
  'Rộng (cm)': 'PRODUCT_WIDTH',
  'Cao (cm)': 'PRODUCT_HEIGHT',
  'Giá trị hàng (VND) (*)': 'PRODUCT_PRICE',
  'Tiền thu hộ COD (VND)': 'MONEY_COLLECTION',
  'Loại hàng hóa (*)': 'PRODUCT_TYPE',
  'Người trả cước': 'PAYMENT_OBJECT',
  'Yêu cầu khác': 'ORDER_NOTE',
}

const styleMapper = {
  RECEIVER_FULLNAME: 'min-width: 140px;',
  RECEIVER_PHONE: 'min-width: 150px;',
  RECEIVER_ADDRESS: 'min-width: 320px;',
  PRODUCT_NAME: 'min-width: 220px;',
  PRODUCT_QUANTITY: 'min-width: 80px;',
  PRODUCT_WEIGHT: 'min-width: 180px;',
  PRODUCT_PRICE: 'min-width: 180px;',
  MONEY_COLLECTION: 'min-width: 180px;',
  PRODUCT_TYPE: 'min-width: 140px;',
  PAYMENT_OBJECT: 'min-width: 140px;',
  ORDER_NOTE: 'min-width: 220px;',
}

const paymentObjectOptions = [
  { name: 'Người nhận trả', value: 'Người nhận trả' },
  { name: 'Người gửi trả', value: 'Người gửi trả' },
]

const productTypeOptions = [
  { name: 'Bưu kiện', value: 'Bưu kiện' },
  { name: 'Tài liệu', value: 'Tài liệu' },
]

const checkFileTemplate = (arrayA, arrayB) => {
  const normalize = (str) => str.replace(/\s+/g, ' ').trim()

  const setB = new Set(arrayB.map(normalize))

  return arrayA.every((element) => setB.has(normalize(element)))
}

const fileInput = ref(null)
const file = ref(null)
const fileName = ref('')
const excelData = ref([])

const resetState = () => {
  file.value = null
  fileName.value = ''
  excelData.value = []
  isVerified.value = false
  orderServicesOptions.value = []
  orderServices.value = []
  orderState.value = []
}

const onFileChange = (event) => {
  resetState()
  file.value = event.target.files[0]
  fileName.value = event.target.files[0].name
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    let rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

    rows = rows.map((row) => {
      const newRow = { ...row }
      delete newRow.STT
      delete newRow['Mã đơn hàng ']
      return newRow
    })

    rows = rows.map((row) => {
      const cleanRow = {}
      for (const [key, value] of Object.entries(row)) {
        if (!key.includes('EMPTY')) {
          cleanRow[key.trim()] = value
        }
      }
      return cleanRow
    })

    rows = rows.filter((row) =>
      Object.values(row).some((v) => v !== '' && v !== null && v !== undefined),
    )

    const arrA = Object.keys(fieldMapper)
    const arrB = Object.keys(rows[0])

    if (!checkFileTemplate(arrA, arrB)) {
      toast.error('File template không đúng')
      file.value = null
      fileName.value = ''
      excelData.value = []
      return
    }

    excelData.value = rows.map((item) => {
      let newItem = {}
      Object.entries(item).map(([key, value]) => {
        newItem[fieldMapper[key]] = value
      })
      return newItem
    })
    orderServicesOptions.value = new Array(excelData.value.length).fill(null)
    orderServices.value = new Array(excelData.value.length).fill(null)
    orderState.value = new Array(excelData.value.length).fill(null)
    createdOrders.value = new Array(excelData.value.length).fill(null)
  }
  reader.readAsArrayBuffer(file.value)
}

const onCellEditComplete = (event) => {
  if (event.value === event.newValue) {
    return
  }
  excelData.value[event.index][event.field] = event.newValue
  isVerified.value = false
  orderServicesOptions.value = new Array(excelData.value.length).fill(null)
  orderServices.value = new Array(excelData.value.length).fill(null)
  orderState.value = new Array(excelData.value.length).fill(null)
}

const fetchServices = async () => {
  orderServicesOptions.value = new Array(excelData.value.length).fill(null)
  orderServices.value = new Array(excelData.value.length).fill(null)
  orderState.value = new Array(excelData.value.length).fill(null)
  const objData = excelData.value.map((item) => {
    let obj = {}
    obj['SENDER_ADDRESS'] = senderAddress.value.address
    obj['RECEIVER_ADDRESS'] = item['RECEIVER_ADDRESS']
    obj['PRODUCT_TYPE'] = item['PRODUCT_TYPE'] === 'Tai lieu' ? 'TH' : 'HH'
    obj['PRODUCT_WEIGHT'] = item['PRODUCT_WEIGHT']
    obj['PRODUCT_PRICE'] = item['PRODUCT_PRICE']
    obj['MONEY_COLLECTION'] = item['MONEY_COLLECTION']
    obj['PRODUCT_WIDTH'] = item['PRODUCT_WIDTH'] || null
    obj['PRODUCT_HEIGHT'] = item['PRODUCT_HEIGHT'] || null
    obj['PRODUCT_LENGTH'] = item['PRODUCT_LENGTH'] || null
    obj['TYPE'] = 1
    return obj
  })
  const chunkSize = 10
  const batchs = chunkArray(objData, chunkSize)
  for (let i = 0; i < batchs.length; i++) {
    const batch = batchs[i]
    const promises = batch.map((obj, index) => {
      const idx = i * chunkSize + index
      return api
        .post('/connector/viettelpost/price-all-nlp', { data: obj })
        .then((res) => ({ res, idx }))
        .catch((err) => ({ err, idx }))
    })

    const result = await Promise.allSettled(promises)

    result.map((response) => {
      if (response.status === 'fulfilled' && !response.value.res?.data?.data?.error) {
        orderServicesOptions.value[response.value.idx] = response.value.res.data.data.RESULT
        orderServices.value[response.value.idx] = response.value.res.data.data.RESULT[0]
        orderState.value[response.value.idx] = { status: 'success', message: 'Đơn hợp lệ' }
      } else {
        orderState.value[response.value.idx] = { status: 'error', message: 'Đơn không hợp lệ' }
      }
    })
  }
  isVerified.value = true
}

const onServiceSelect = (index, value) => {
  orderServices.value[index] = orderServicesOptions.value[index].find(
    (service) => service.MA_DV_CHINH === value,
  )
  console.log('Selected service:', orderServices.value[index])
}

const batchOrderCreate = async () => {
  const orders = excelData.value.map((item, idx) => {
    let { PAYMENT_OBJECT, ...obj } = item
    obj['SENDER_FULLNAME'] = senderName.value
    obj['SENDER_PHONE'] = senderPhone.value
    obj['SENDER_ADDRESS'] = senderAddress.value.address
    obj['PRODUCT_TYPE'] = item['PRODUCT_TYPE'] === 'Tài liệu' ? 'TH' : 'HH'
    obj['ORDER_SERVICE'] = orderServices.value[idx]?.MA_DV_CHINH || null
    obj['PRODUCT_DETAIL'] = []
    if (item['MONEY_COLLECTION']) {
      if (item['PAYMENT_OBJECT'] === 'Người nhận trả') {
        obj['ORDER_PAYMENT'] = 2
      } else {
        obj['ORDER_PAYMENT'] = 3
      }
    } else {
      if (item['PAYMENT_OBJECT'] === 'Người nhận trả') {
        obj['ORDER_PAYMENT'] = 4
      } else {
        obj['ORDER_PAYMENT'] = 1
      }
    }
    return obj
  })

  const chunkSize = 10
  const batches = chunkArray(orders, chunkSize)
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const promises = batch.map((order, idx) => {
      const index = i * chunkSize + idx
      return api
        .post('/connector/viettelpost/order/create-nlp', { data: order })
        .then((res) => ({ res, index }))
        .catch((err) => ({ err, index }))
    })

    const result = await Promise.allSettled(promises)

    result.forEach((response) => {
      if (response.status === 'fulfilled') {
        if (response.value.err) {
          orderState.value[response.value.index] = { status: 'error', message: 'Tạo đơn thất bại' }
        } else {
          if (response.value.res.data?.success) {
            orderState.value[response.value.index] = {
              status: 'success',
              message: 'Tạo đơn thành công',
            }
            createdOrders.value[response.value.index] = response.value.res.data.data
          } else {
            orderState.value[response.value.index] = {
              status: 'error',
              message: 'Tạo đơn thất bại',
            }
          }
        }
      } else {
        orderState.value[response.value.index] = { status: 'error', message: 'Tạo đơn thất bại' }
      }
    })
  }
  printShow.value = true
}

const carrierMap = {
  VIETTEL_POST: 'viettelpost',
  YUNDA: 'yunda',
}

const onPrintOrder = (idx) => {
  const order = createdOrders.value[idx]
  const carrier = carrierMap[order.carrier]
  const orderNumber = order.waybill
  const path = `/print-order/${carrier}?ordercode=${orderNumber}`
  const routeData = router.resolve(path)
  window.open(routeData.href, '_blank')
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/docs/batch-orders.xlsx'
  link.download = 'batch-orders.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

}
</script>

<style>
.frozen-column-emerald {
  background-color: #ecfdf5 !important;
}

.my-app-dark .frozen-column-emerald {
  background-color: #064e3b !important;
}
</style>
