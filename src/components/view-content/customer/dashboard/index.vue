<template>
  <div class="h-full p-4 flex flex-col gap-2 overflow-auto">
    <span class="text-xl font-semibold text-color">Quản lý đơn hàng</span>

    <div class="mt-4">
      <Card>
        <template #title>
          <span class="text-color font-semibold text-sm">Bộ lọc tìm kiếm</span>
        </template>
        <template #content>
          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-2">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="queryParams.orderNumber"
                  placeholder="Lọc theo mã vận đơn"
                  size="small"
                  fluid=""
                  @update:model-value="onOrderNumberChange"
                />
              </IconField>
            </div>
            <div>
              <DatePicker
                v-model="dates"
                name="dates"
                selectionMode="range"
                manulInput="false"
                dateFormat="dd/mm/yy"
                size="small"
                placeholder="Lọc theo thời gian"
                fluid
                @update:model-value="onDateChange"
                :disabled="dateDisabled"
                showButtonBar
              />
            </div>
            <div>
              <Select
                v-model="queryParams.carrier"
                :options="carriers"
                optionLabel="label"
                optionValue="value"
                placeholder="Lọc theo đối tác"
                size="small"
                fluid
                @update:model-value="onCarrierChange"
                :disabled="carrierDisabled"
              />
            </div>
            <div class="col-span-4 flex items-center justify-end gap-4">
              <Button
                @click="resetFilter"
                icon="pi pi-filter-slash"
                variant="outlined"
                severity="danger"
                label="Xóa bộ lọc"
                size="small"
              />
              <Button @click="getOrders" icon="pi pi-filter" label="Tìm kiếm" size="small" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="mt-4">
      <Card>
        <template #title>
          <span class="text-color font-semibold">Danh sach don hang</span>
        </template>
        <template #content>
          <div>
            <DataTable
              v-model:selection="selectedOrder"
              :value="orders"
              stripedRows
              showGridlines
              selectionMode="single"
              @rowSelect="onRowSelect"
              size="small"
              scrollable
              scrollHeight="flex"
              paginator
              :rows="queryParams.limit"
              :totalRecords="totalRecords"
              @page="onPageChange"
              :lazy="true"
            >
              <Column frozen alignFrozen="left" header="Mã vận đơn" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm font-semibold text-blue-500">{{
                    slotProps.data.waybill
                  }}</span>
                </template>
              </Column>
              <Column header="Đối tác" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    carrierMapper[slotProps.data.carrier] || ''
                  }}</span>
                </template>
              </Column>
              <Column header="Mặt hàng" style="min-width: 250px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    slotProps.data.rawData.PRODUCT_NAME || ''
                  }}</span>
                </template>
              </Column>
              <Column header="Giá cước" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    formatCurrency(slotProps.data.rawData.MONEY_TOTAL) || ''
                  }}</span>
                </template>
              </Column>
              <Column header="COD" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    formatCurrency(slotProps.data.rawData.MONEY_COLLECTION) || ''
                  }}</span>
                </template>
              </Column>
              <Column header="Trạng thái" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{ slotProps.data.lastStatus || '' }}</span>
                </template>
              </Column>
              <Column header="Cập nhật" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    formatDate(slotProps.data.lastSyncedAt) || ''
                  }}</span>
                </template>
              </Column>
              <Column header="Ngày tạo đơn" style="min-width: 150px">
                <template #body="slotProps">
                  <span class="text-sm text-color">{{
                    formatDate(slotProps.data.createdAt) || ''
                  }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Thông tin đơn hàng"
      style="width: 100%; height: 100vh; background-color: var(--color-surface-50)"
      :contentStyle="{ height: '100%', display: 'flex', flexDirection: 'column' }"
      class="my-dialog"
    >
      <div class="h-full flex gap-4">
        <Card class="w-full h-full overflow-auto">
          <template #content>
            <div class="text-color text-sm divider-y flex flex-col gap-2">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span>Mã vận đơn</span>
                  <span class="font-semibold">{{ selectedOrder.waybill }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Mã tham chiếu</span>
                  <span class="font-semibold">{{
                    selectedOrder.rawData.ORDER_REFERENCE || ''
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Ngày tạo đơn hàng</span>
                  <span class="font-semibold">{{ formatDateTime(selectedOrder.createdAt) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Trạng thái</span>
                  <span class="font-semibold">{{ selectedOrder.lastStatus }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Mã dịch vụ</span>
                  <span class="font-semibold">{{ selectedOrder.rawData.ORDER_SERVICE }}</span>
                </div>
              </div>
              <div class="border-t border-surface-100 py-2 flex flex-col gap-2">
                <span class="text-primary font-semibold">Người gửi</span>
                <div class="text-sm flex flex-col gap-1">
                  <span class="font-bold">
                    {{ selectedOrder.rawData.SENDER_FULLNAME }} -
                    {{ selectedOrder.rawData.SENDER_PHONE }}
                  </span>
                  <span>{{ selectedOrder.rawData.SENDER_ADDRESS }}</span>
                </div>
              </div>
              <div class="border-t border-surface-100 py-2 flex flex-col gap-2">
                <span class="text-primary font-semibold">Người nhận</span>
                <div class="text-sm flex flex-col gap-1">
                  <span class="font-bold">
                    {{ selectedOrder.rawData.RECEIVER_FULLNAME }} -
                    {{ selectedOrder.rawData.RECEIVER_PHONE }}
                  </span>
                  <span>{{ selectedOrder.rawData.RECEIVER_ADDRESS }}</span>
                </div>
              </div>
              <div class="border-t border-surface-100 py-2 flex flex-col gap-2">
                <span class="text-primary font-semibold">Phí và tiền thu hộ</span>
                <div class="text-sm flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span>Hình thức</span>
                    <span class="font-semibold">{{
                      selectedOrder.rawData.MONEY_COLLECTION ? 'Thu hộ tiền hàng' : 'Không thu hộ'
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span
                      >Tổng cước
                      {{
                        `(${selectedOrder.rawData.ORDER_PAYMENT === 1 || selectedOrder.rawData.ORDER_PAYMENT === 3 ? 'Người gửi trả' : 'Người nhận trả'})`
                      }}</span
                    >
                    <span class="font-semibold">{{
                      formatCurrency(selectedOrder.rawData.MONEY_TOTAL)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Tiền thu hộ</span>
                    <span class="font-semibold">{{
                      selectedOrder.rawData.MONEY_COLLECTION
                        ? formatCurrency(selectedOrder.rawData.MONEY_COLLECTION)
                        : 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
        <Card class="w-full h-full overflow-auto">
          <template #content>
            <div class="flex flex-col gap-4 text-sm text-color">
              <span class="text-primary font-bold">Thông tin hàng hóa</span>
              <div class="flex flex-col gap-2">
                <div v-if="selectedOrder.rawData.PRODUCT_DETAIL.length">
                  <div
                    v-for="(prod, idx) in selectedOrder.rawData.PRODUCT_DETAIL"
                    :key="idx"
                    class="py-2 border-b border-surface-200"
                  >
                    <div class="flex items-center justify-between">
                      <span>Tên hàng {{ idx + 1 }}</span>
                      <span class="font-semibold">{{ prod.PRODUCT_NAME }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>Số lượng</span>
                      <span class="font-semibold">{{ prod.PRODUCT_QUANTITY }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>Cân nặng</span>
                      <span class="font-semibold">{{ prod.PRODUCT_WEIGHT }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span>Giá tiền</span>
                      <span class="font-semibold">{{ formatCurrency(prod.PRODUCT_PRICE) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="py-2 border-b border-surface-200">
                  <div class="flex items-center justify-between">
                    <span>Tên hàng</span>
                    <span class="font-semibold">{{ selectedOrder.rawData.PRODUCT_NAME }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Số lượng</span>
                    <span class="font-semibold">{{ selectedOrder.rawData.PRODUCT_QUANTITY }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Cân nặng</span>
                    <span class="font-semibold">{{ selectedOrder.rawData.PRODUCT_WEIGHT }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Giá tiền</span>
                    <span class="font-semibold">{{
                      formatCurrency(selectedOrder.rawData.PRODUCT_PRICE)
                    }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2 border-b border-surface-200 py-2">
                  <div class="flex items-center justify-between">
                    <span class="text-primary font-semibold text-sm">Tổng khối lượng</span>
                    <span class="font-bold">{{ selectedOrder.rawData.PRODUCT_WEIGHT }}(g)</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-primary font-semibold text-sm">Tổng giá trị</span>
                    <span class="font-bold">{{
                      formatCurrency(selectedOrder.rawData.PRODUCT_PRICE)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-primary font-semibold text-sm">Loại hàng hóa</span>
                    <span class="font-bold">{{
                      selectedOrder.rawData.PRODUCT_TYPE === 'HH' ? 'Bưu kiện' : 'Tài liệu'
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-primary font-semibold text-sm">Kích thước</span>
                    <span class="font-bold">{{
                      `${selectedOrder.rawData.PRODUCT_WIDTH || 1}x${selectedOrder.rawData.PRODUCT_HEIGHT || 1}x${selectedOrder.rawData.PRODUCT_LENGTH || 1} (cm)`
                    }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm font-semibold">Ghi chú vận đơn</span>
                  <div class="text-xs">
                    {{ selectedOrder.rawData.ORDER_NOTE || 'Không có ghi chú' }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
        <Card class="w-full h-full overflow-auto relative">
          <template #content>
            <div class="flex flex-col gap-2 h-full sticky top-0">
              <div class="border-b border-surface-200">
                <span class="text-sm text-color font-medium">Ảnh báo phát</span>
                <div class="h-24"></div>
              </div>
              <div class="flex-1 flex flex-col min-h-0">
                <span class="text-sm font-medium pb-2">Hành trình đơn</span>
                <div class="flex-1 overflow-auto">
                  <Timeline :value="selectedOrderEvents">
                    <template #opposite="slotProps">
                      <span class="text-xs">{{ formatDateTime(slotProps.item.time) }}</span>
                    </template>
                    <template #content="slotProps">
                      <div class="text-xs">
                        {{ slotProps.item.statusStd }} - {{ slotProps.item.location }}
                      </div>
                    </template>
                  </Timeline>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="onPrint" icon="pi pi-print" label="In đơn" severity="info" size="small" />
          <Button @click="onCancelOrder(selectedOrder.waybill)" icon="pi pi-times" label="Hủy đơn" severity="warn" size="small" />
          <Button @click="onDeleteOrder(selectedOrder.waybill)" icon="pi pi-trash" label="Xóa đơn" severity="danger" size="small" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import {
  Card,
  IconField,
  InputIcon,
  InputText,
  DatePicker,
  Select,
  Button,
  DataTable,
  Column,
  Dialog,
  Timeline,
} from 'primevue'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/helpers'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

const router = useRouter()

const dialogVisible = ref(false)
const orders = ref([])
const dates = ref([])
const selectedOrder = ref(null)
const selectedOrderEvents = ref([])
const dateDisabled = ref(false)
const carrierDisabled = ref(false)
const totalRecords = ref(0)
const carriers = [
  {
    label: 'Viettel Post',
    value: 'VIETTEL_POST',
  },
]

const carrierMapper = {
  VIETTEL_POST: 'Viettel Post',
}

const queryParams = ref({
  page: 1,
  limit: 10,
  carrier: null,
  startDate: dates.value[0] || null,
  endDate: dates.value[1] || null,
  orderNumber: null,
})

const resetFilter = () => {
  queryParams.value.carrier = null
  queryParams.value.orderNumber = null
  queryParams.value.startDate = null
  queryParams.value.endDate = null
  dates.value = []
  carrierDisabled.value = false
  dateDisabled.value = false
}

const getOrders = async () => {
  try {
    const res = await api.get('connector/viettelpost/order/list', {
      params: queryParams.value,
    })
    orders.value = res.data.data
    totalRecords.value = res.data.pagination.total
    console.log(res.data)
  } catch (err) {
    console.log(err)
  }
}

const getOrderEvents = async (orderCode) => {
  try {
    const res = await api.get(`connector/viettelpost/order/events`, {
      params: {
        orderId: orderCode,
      },
    })
    selectedOrderEvents.value = res.data.data || []
  } catch (err) {
    console.log(err)
    toast.error('Lỗi khi lấy thông tin hành trình đơn')
  }
}

const onRowSelect = (event) => {
  selectedOrder.value = event.data
  getOrderEvents(event.data.id)
  dialogVisible.value = true
}

const onDateChange = (event) => {
  if (event && event[0]) {
    queryParams.value.startDate = event[0]
  } else {
    queryParams.value.startDate = null
  }
  if (event && event[1]) {
    queryParams.value.endDate = event[1]
  } else {
    queryParams.value.endDate = null
  }
}

const onOrderNumberChange = (event) => {
  if (event.length > 0) {
    dates.value = []
    queryParams.value.carrier = null
    dateDisabled.value = true
    carrierDisabled.value = true
    queryParams.value.orderNumber = event
  } else {
    dateDisabled.value = false
    carrierDisabled.value = false
    queryParams.value.orderNumber = null
  }
}

const onCarrierChange = (event) => {
  queryParams.value.carrier = event
}

const carrierMapPrint = {
  VIETTEL_POST: 'viettelpost',
}

const onPrint = () => {
  const waybill = selectedOrder.value?.waybill
  const carrier = carrierMapPrint[selectedOrder.value?.carrier]
  const path = `/print-order/${carrier}?ordercode=${waybill}`
  const routeData = router.resolve(path)
  window.open(routeData.href, '_blank')
}

const onPageChange = (event) => {
  queryParams.value.page = event.page + 1
  getOrders()
}

const onCancelOrder = async (orderNumber) => {
  try {
    const res = await api.post('connector/viettelpost/order/update', {
      type: 4,
      waybill: orderNumber,
    })
    getOrders()
    toast.success('Hủy đơn thành công')
  } catch (err) {
    console.log(err)
    toast.error(err.response?.data?.message || 'Lỗi khi hủy đơn')
  }
  finally{
    dialogVisible.value = false
  }
}

const onDeleteOrder = async (orderNumber) => {
  try {
    const res = await api.post('connector/viettelpost/order/update', {
      type: 11,
      waybill: orderNumber,
    })
    getOrders()
    toast.success('Xóa đơn thành công')
  } catch (err) {
    console.log(err)
    toast.error(err.response?.data?.message || 'Lỗi khi xóa đơn')
  }
  finally{
    dialogVisible.value = false
  }
}

onMounted(() => {
  getOrders()
})
</script>

<style>
.my-dialog {
  background-color: var(--color-surface-50) !important;
}

.my-app-dark .my-dialog {
  background-color: var(--color-surface-800) !important;
}
</style>
