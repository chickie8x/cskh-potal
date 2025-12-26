<template>
  <Card class="w-full mt-4">
    <template #content>
      <div class="flex items-center gap-8 py-4">
        <div class="flex items-center gap-1">
          <RadioButton v-model="verrifyMode" value="single" size="small" />
          <label for="" class="text-sm text-color font-medium">{{ t('singleAddress') }}</label>
        </div>
        <div class="flex items-center gap-1">
          <RadioButton v-model="verrifyMode" value="batch" size="small" />
          <label for="" class="text-sm text-color font-medium">{{ t('batchAddress') }}</label>
        </div>
      </div>
      <div v-if="verrifyMode === 'single'">
        <Form
          v-slot="$form"
          :initialValues="{ address: '' }"
          :resolver="resolver"
          @submit="onFormSubmit"
        >
          <div class="flex items-end gap-1 w-full">
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-sm font-medium">{{ t('address') }}</label>
              <InputText name="address" class="w-full" size="small" />
            </div>
            <Button
              type="submit"
              :label="t('verify')"
              icon="pi pi-check"
              :loading="loading"
              size="small"
            />
          </div>
        </Form>
        <Card
          v-if="verifiedAddressSingle && isDone"
          class="mt-4 p-4 bg-green-200 result-card-success"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-green-900" />
              <h2 class="text-green-900 font-bold text-xl">{{ t('result') }}</h2>
            </div>
          </template>
          <template #content>
            <div class="flex items-center text-sm mt-2">
              <span class="capitalize">{{ verifiedAddressSingle }}</span>
            </div>
          </template>
        </Card>
        <Card v-if="!verifiedAddressSingle && isDone" class="mt-4 p-4 result-card-failure">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-times-circle text-red-900" />
              <h2 class="text-red-900 font-bold text-xl">{{ t('result') }}</h2>
            </div>
          </template>
          <template #content>
            <div class="flex items-center text-sm">
              <Message severity="error" icon="pi pi-ban" size="small">{{
                t('errorHappened')
              }}</Message>
            </div>
          </template>
        </Card>
      </div>
      <div v-if="verrifyMode === 'batch'">
        <div class="flex items-end gap-4 justify-between">
          <div class="flex items-end">
            <span v-if="filename" class="flex items-center gap-1 text-sm"
              ><i class="pi pi-file text-primary"></i>{{ filename }}</span
            >
          </div>
          <div class="flex items-center gap-4 justify-end">
            <input
              ref="fileChooser"
              type="file"
              name="file"
              accept=".xlsx, .xls"
              id="fileChooser"
              hidden
              @change="onFileChange"
            />
            <Button
              type="button"
              :label="t('upload')"
              size="small"
              icon="pi pi-upload"
              @click="fileChooser.click()"
            />
            <Button
              icon="pi pi-download"
              :label="t('downloadTemplate')"
              variant="outlined"
              severity="info"
              size="small"
              @click="downloadTemplate"
            />
          </div>
        </div>
        <div v-if="file" class="mt-2">
          <DataTable :value="addresses" responsiveLayout="scroll" showGridlines>
            <Column field="index" header="STT" style="text-align: center; padding: 1rem" />
            <Column field="address" :header="t('address')" style="width: 50%; padding: 1rem">
              <template #body="slotProps">
                <span class="text-sm">{{ slotProps.data.address }}</span>
              </template>
            </Column>
            <Column
              field="verifiedAddress"
              :header="t('verifiedAddress')"
              style="width: 50%; padding: 1rem"
            >
              <template #body="slotProps">
                <div v-if="slotProps.data.verifiedAddress.length">
                  <i
                    v-if="slotProps.data.verifiedAddress === 'Lỗi'"
                    class="pi pi-times text-red-500 mr-2 mt-1"
                    size="small"
                  ></i>
                  <i v-else class="pi pi-check-circle text-green-700 mr-2 mt-1" size="small"></i>
                  <span
                    class="text-sm text-color"
                    :class="[
                      slotProps.data.verifiedAddress === 'Lỗi' ? 'text-red-500' : 'text-green-700',
                    ]"
                  >
                    {{ slotProps.data.verifiedAddress }}
                  </span>
                </div>
                <div v-else></div>
              </template>
            </Column>
          </DataTable>
          <div class="py-4 flex justify-end items-center">
            <Button
              @click="batchVerify"
              type="button"
              :label="t('verify')"
              icon="pi pi-check"
              :loading="loading"
              size="small"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { Card, Button, InputText, RadioButton, DataTable, Column, Message } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import api from '@/api/axios'
import * as XLSX from 'xlsx'
import { chunkArray } from '@/utils/helpers'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const resolver = zodResolver(z.object({ address: z.string().min(1) }))
const verrifyMode = ref('single')
const fileChooser = ref(null)
const filename = ref('')
const file = ref(null)
const addresses = ref([])
const verifiedAddressSingle = ref(null)
const isDone = ref(false)

const onFormSubmit = async ($form) => {
  if (!$form.valid) {
    toast.error(t('enterAllInfoNeeded'))
    return
  }
  loading.value = true
  try {
    const response = await api.post('/connector/viettelpost/checking-address', {
      address: $form.values.address,
    })
    if (response.data.success) {
      verifiedAddressSingle.value = response.data.data?.formattedAddress
      isDone.value = true
    } else {
      toast.error(response.data.message || t('addressInvalid'))
    }
  } catch (error) {
    toast.error(t('addressInvalid'))
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onFileChange = (event) => {
  file.value = event.target.files[0]
  filename.value = event.target.files[0].name
  if (!file.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const dataJson = XLSX.utils.sheet_to_json(worksheet)
    dataJson.map((item, index) => {
      if (item.address) {
        addresses.value.push({
          index: index + 1,
          address: item.address,
          verifiedAddress: '',
        })
      }
    })
  }
  reader.readAsArrayBuffer(file.value)
}

const batchVerify = async () => {
  if (!file.value) {
    toast.error(t('selectFile'))
    return
  }
  loading.value = true
  const chunkSize = 2
  const chunkedAddresses = chunkArray(addresses.value, chunkSize)

  for (let i = 0; i < chunkedAddresses.length; i++) {
    const batch = chunkedAddresses[i]
    const promises = batch.map((address, index) => {
      const idx = i * chunkSize + index
      return api
        .post('/connector/viettelpost/checking-address', { address: address.address })
        .then((res) => ({ idx, res }))
        .catch((err) => {
          throw { idx, err }
        })
    })
    const results = await Promise.allSettled(promises)
    results.forEach((response) => {
      if (response.status === 'fulfilled') {
        addresses.value[response.value.idx].verifiedAddress =
          response.value.res.data?.data?.formattedAddress || t('error')
      } else {
        console.log(response.value)
        // addresses.value[response.value.idx].verifiedAddress = 'Lỗi khi xác minh địa chỉ'
      }
    })
  }
  loading.value = false
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/docs/addresses.xlsx'
  link.download = 'addresses.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
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
