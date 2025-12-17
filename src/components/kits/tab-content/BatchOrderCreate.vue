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
        <Button icon="pi pi-upload" label="Upload" size="small" @click="fileInput.click()" />
        <Button
          icon="pi pi-download"
          variant="outlined"
          severity="info"
          label="File mẫu"
          size="small"
          @click="fileInput.value = null"
        />
      </div>
    </div>

    <Card class="mt-4">
      <template #title>
        <div class="flex items-center gap-1">
          <i class="pi pi-user size-5" />
          <span class="font-semibold text-color text-sm">Thông tin người gửi</span>
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
        <div class="flex items-center gap-1">
          <i class="pi pi-list size-5 mt-1" />
          <span class="font-semibold text-color text-sm">Danh sách đơn hàng</span>
        </div>
      </template>
      <template #content>
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
            style="min-width: 50px; background-color: #ecfdf5"
          >
            <template #body="slotProps">
              <div class="text-xs text-color">{{ slotProps.index }}</div>
            </template>
          </Column>
          <Column
            frozen
            alignFrozen="left"
            field="Trạng thái"
            header="Trạng thái"
            style="min-width: 100px; background-color: #ecfdf5"
          >
            <template #body="slotProps">
              <div class="text-xs text-color">{{ slotProps.data['Trạng thái'] }}</div>
            </template>
          </Column>
          <Column
            frozen
            alignFrozen="left"
            field="Dịch vụ"
            header="Dịch vụ"
            style="min-width: 150px; background-color: #ecfdf5"
          >
            <template #body="slotProps">
              <Select
                :options="slotProps.data['Dịch vụ']"
                placeholder="Chọn dịch vụ"
                size="small"
              />
            </template>
          </Column>
          <Column
            frozen
            alignFrozen="left"
            field="Giá cước"
            header="Giá cước"
            style="min-width: 100px; background-color: #ecfdf5"
          >
            <template #body="slotProps">
              <div class="text-xs text-color">{{ slotProps.data['Giá cước'] }}</div>
            </template>
          </Column>
          <Column
            v-for="col in Object.entries(fieldMapper)"
            :key="col[0]"
            :field="col[1]"
            :header="col[0]"
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
              <template v-if="field === 'PAYMENT_OBJECT'">
                <Select
                  :options="paymentObjectOptions"
                  optionLabel="name"
                  optionValue="value"
                  v-model="data[field]"
                  size="small"
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

const authStore = useAuthStore()
const senderAddresses = ref(authStore.userAddress)
const senderAddress = ref(senderAddresses.value[0])
const senderName = ref(authStore.user?.name)
const senderPhone = ref(authStore.user?.phone)

const fieldMapper = {
  'Tên người nhận (*)': 'RECEIVER_FULLNAME',
  'Số ĐT người nhận (*)': 'RECEIVER_PHONE',
  'Địa chỉ nhận (*)': 'RECEIVER_ADDRESS',
  'Tên hàng hóa (*)': 'PRODUCT_NAME',
  'Số lượng': 'PRODUCT_QUANTITY',
  'Trọng lượng (gram) (*)': 'PRODUCT_WEIGHT',
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

const checkFileTemplate = (arrayA, arrayB) => {
  const normalize = (str) => str.replace(/\s+/g, ' ').trim();
  
  const setB = new Set(arrayB.map(normalize));
  
  return arrayA.every(element => setB.has(normalize(element)));
}

const fileInput = ref(null)
const file = ref(null)
const fileName = ref('')
const excelData = ref([])
const onFileChange = (event) => {
  file.value = event.target.files[0]
  fileName.value = event.target.files[0].name
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    let rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

    // Loại bỏ cột STT, MA DON HANG
    rows = rows.map((row) => {
      const newRow = { ...row }
      delete newRow.STT
      delete newRow['Mã đơn hàng ']
      return newRow
    })

    // Loại bỏ các cột có tên chứa 'EMPTY'
    rows = rows.map((row) => {
      const cleanRow = {}
      for (const [key, value] of Object.entries(row)) {
        if (!key.includes('EMPTY')) {
          cleanRow[key.trim()] = value
        }
      }
      return cleanRow
    })

    // Lọc bỏ row trống (chỉ toàn giá trị rỗng sau khi bỏ STT)
    rows = rows.filter((row) =>
      Object.values(row).some((v) => v !== '' && v !== null && v !== undefined),
    )

    const arrA = Object.keys(fieldMapper)
    const arrB = Object.keys(rows[0])
    console.log(arrA)
    console.log(arrB)
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
  }
  reader.readAsArrayBuffer(file.value)
}

const onCellEditComplete = (event) => {
  excelData.value[event.index][event.field] = event.newValue
}
</script>
