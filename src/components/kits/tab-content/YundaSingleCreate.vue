<template>
  <div>
    <Form v-slot="$form">
      <div class="flex flex-col gap-8">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-user" />
              <span class="text-sm text-color font-semibold">{{ t('sender') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-3 gap-8">
              <IconField>
                <InputIcon class="pi pi-user" />
                <InputText
                  name="senderName"
                  :placeholder="t('senderName')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <IconField>
                <InputIcon class="pi pi-phone" />
                <InputText
                  name="senderPhone"
                  :placeholder="t('senderPhone')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <IconField>
                <InputIcon class="pi pi-map-marker" />
                <InputText
                  name="senderAddress"
                  :placeholder="t('senderAddress')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <Select
                name="senderProvince"
                :options="provinceList"
                optionLabel="name"
                :placeholder="t('province')"
                size="small"
                @change="onProvinceChange"
              />
              <Select
                name="senderProvince"
                :options="senderCityList"
                optionLabel="name"
                :placeholder="t('city')"
                size="small"
                @change="onProvinceChange"
              />
              <Select
                name="senderDistrict"
                :options="senderCountyList"
                optionLabel="name"
                :placeholder="t('district')"
                size="small"
                @change="onProvinceChange"
              />
            </div>
          </template>
        </Card>
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-user" />
              <span class="text-sm text-color font-semibold">{{ t('receiver') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-3 gap-8">
              <IconField>
                <InputIcon class="pi pi-user" />
                <InputText
                  name="senderName"
                  :placeholder="t('senderName')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <IconField>
                <InputIcon class="pi pi-phone" />
                <InputText
                  name="senderPhone"
                  :placeholder="t('senderPhone')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <IconField>
                <InputIcon class="pi pi-map-marker" />
                <InputText
                  name="senderAddress"
                  :placeholder="t('senderAddress')"
                  class="w-full"
                  size="small"
                />
              </IconField>
              <Select
                name="senderProvince"
                :options="provinceList"
                optionLabel="name"
                :placeholder="t('province')"
                size="small"
                @change="onProvinceChange"
              />
              <Select
                name="senderProvince"
                :options="senderCityList"
                optionLabel="name"
                :placeholder="t('city')"
                size="small"
                @change="onProvinceChange"
              />
              <Select
                name="senderDistrict"
                :options="senderCountyList"
                optionLabel="name"
                :placeholder="t('district')"
                size="small"
                @change="onProvinceChange"
              />
            </div>
            <div class="mt-8 border-t border-surface-200 py-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-box" />
                <span class="text-sm text-color font-semibold">{{
                  t('productAndServiceInfo')
                }}</span>
              </div>
              <div class="grid grid-cols-2 gap-8 mt-2">
                <Select
                  name="specialType"
                  :options="specialType"
                  optionLabel="label"
                  :placeholder="t('specialType')"
                  size="small"
                />
                <div class="flex items-center gap-1">
                  <label class="text-sm text-color block min-w-18" for="weight">{{
                    t('weight')
                  }}</label>
                  <InputNumber name="weight" size="small" fluid :format="false" />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { province, specialType } from '@/utils/const'
import { IconField, InputIcon, InputText, InputNumber, Select, Card } from 'primevue'
import { Form } from '@primevue/forms'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const selectedProvince = ref(null)
const provinceList = ref(province)
const senderCityList = ref([])
const senderCountyList = ref([])
const receiverCityList = ref([])
const receiverCountyList = ref([])

const onProvinceChange = (event) => {
  console.log(event)
}
</script>
