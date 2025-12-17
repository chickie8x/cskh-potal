<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Settings</h1>
    <span class="text-sm text-gray-500">Quản lý cài đặt tài khoản và các dịch vụ tích hợp.</span>
    <div class="mt-4 flex flex-col gap-4">
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-truck text-primary"></i>
            <span>Đơn vị vận chuyển</span>
          </div>
          <div>
            <span class="text-sm text-gray-500">Quản lý các đơn vị vận chuyển đã kết nối</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between py-2">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="carrierSearchQuery" placeholder="Search" size="small" />
              </IconField>
              <Button
                @click="connectCarrier"
                label="Thêm mới"
                size="small"
                icon="pi pi-plus"
                class="ml-2"
              />
            </div>
            <div class="flex items-center justify-between py-2">
              <DataView
                :value="connectedCarrier"
                paginator
                :rows="5"
                :total="connectedCarrier.length"
                class="w-full"
              >
                <template #list="slotProps">
                  <div
                    v-for="carrier in slotProps.items"
                    :key="carrier.id"
                    class="p-2 border-b border-surface-200 dark:border-surface-700"
                  >
                    <div class="grid grid-cols-4 gap-4 w-full">
                      <div class="flex items-center gap-2">
                        <img
                          :src="carrier.img"
                          :alt="carrier.name"
                          class="w-8 h-8 object-contain rounded-sm"
                        />
                        <span class="font-semibold">{{ carrier.name }}</span>
                      </div>
                      <div class="text-sm text-gray-500 flex items-center gap-1">
                        <span
                          class="block w-2 h-2 rounded-full"
                          :class="[carrier.status === 'active' ? 'bg-green-500' : 'bg-gray-500']"
                        ></span>
                        <span
                          class="capitalize"
                          :class="[
                            carrier.status === 'active' ? 'text-green-600' : 'text-gray-600',
                          ]"
                          >{{ carrier.status }}</span
                        >
                      </div>
                      <div class="text-sm text-gray-500 flex items-center">
                        Hết hạn: {{ carrier.expiredAt }}
                      </div>
                      <div class="text-sm text-gray-500 flex justify-end">
                        <Button
                          v-tooltip.top="'Disconnect'"
                          size="small"
                          icon="pi pi-sign-out"
                          variant="text"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </DataView>
            </div>
          </div>
        </template>
      </Card>
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-truck text-primary"></i>
              <span>Địa chỉ</span>
            </div>
            <div>
              <Button
                label="Thêm mới"
                size="small"
                icon="pi pi-plus"
                class="ml-2"
                @click="addAddress"
              />
            </div>
          </div>
          <div>
            <span class="text-sm text-gray-500">Quản lý các địa chỉ của người dùng</span>
          </div>
        </template>
        <template #content>
          <DataView :value="addresses" :rows="5" paginator>
            <template #list="slotProps">
              <div>
                <div v-for="item in slotProps.items" :key="item.id">
                  <AddressBar :address="item" @deleteAddress="onAddressDelete" />
                </div>
              </div>
            </template>
          </DataView>
        </template>
      </Card>
    </div>
    <Dialog v-model:visible="open" :modal="true" :style="{ width: '40vw' }">
      <template #header>
        <div>
          <h3 class="text-color font-bold text-xl">{{ headerText }}</h3>
        </div>
      </template>
      <div v-if="dialogComponent === 1">
        <AddAddress @addressAdd="onAddressAdd" />
      </div>
      <div v-else>
        <ConnectCarrier />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Card from 'primevue/card'
import IconField from 'primevue/iconfield'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import DataView from 'primevue/dataview'
import Dialog from 'primevue/dialog'
import AddAddress from '@/components/kits/popup-content/AddAddress.vue'
import ConnectCarrier from '@/components/kits/popup-content/ConnectCarrier.vue'
import AddressBar from '@/components/kits/addressbar/index.vue'
import api from '@/api/axios'
import { formatDateTime } from '@/utils/helpers'
import { useAuthStore } from '@/store/authstore'

const authstore = useAuthStore()
const carrierSearchQuery = ref('')
const addresses = computed(() => {
  return authstore.userAddress
})
const open = ref(false)
const dialogComponent = ref(null)
const headerText = ref('')
const carrierLogoMap = {
  GHN: '/images/carrier-logos/ghn.png',
  VIETTEL_POST: '/images/carrier-logos/vtp.png',
}

const connectedCarrier = ref([])
const fetchConnectedCarrier = async () => {
  try {
    const response = await api.get('/connector/viettelpost/general-info')
    if (response.data.success) {
      connectedCarrier.value = response.data.carriers.map((item) => ({
        id: item.id,
        name: item.carrier,
        img: carrierLogoMap[item.carrier],
        status: Date.now() < new Date(item.expiredAt) ? 'active' : 'expired',
        expiredAt: formatDateTime(item.expiredAt),
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchAddress = async () => {
  try {
    const response = await api.get('/customer/address')
    if (response.data.success) {
      authstore.setUserAddress(response.data.data)
    }
  } catch (error) {
    console.error(error)
  }
}

const addAddress = () => {
  open.value = true
  dialogComponent.value = 1
  headerText.value = 'Thêm địa chỉ'
}

const onAddressAdd = () => {
  fetchAddress()
  open.value = false
}

const onAddressDelete = () => {
  fetchAddress()
}

const connectCarrier = () => {
  open.value = true
  dialogComponent.value = 2
  headerText.value = 'Kết nối'
}

onMounted(() => {
  fetchConnectedCarrier()
  fetchAddress()
})
</script>
