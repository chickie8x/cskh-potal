<template>
  <div class="p-4 flex flex-col h-full overflow-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">{{ t('ticketManagement') }}</h2>
    </div>
    <div>
      <Card>
        <template #content>
          <div class="flex flex-col gap-4">
            <div class="flex gap-2">
              <Select
                v-model="query.category"
                :options="ticketCategories"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('ticketCategory')"
                size="small"
                fluid
              />
              <Select
                v-model="query.status"
                :options="ticketStatus"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('ticketStatus')"
                size="small"
                fluid
              />
              <Select
                v-model="query.priority"
                :options="ticketPriorities"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('ticketPriority')"
                size="small"
                fluid
              />
              <Select
                v-model="query.customer"
                :options="customerList"
                optionLabel="name"
                optionValue="id"
                :placeholder="t('customer')"
                size="small"
                fluid
              />
            </div>
            <div class="flex justify-end gap-4">
              <Button
                @click="queryClear"
                label="Reset"
                variant="outlined"
                severity="danger"
                icon="pi pi-refresh"
                size="small"
                class="min-w-26"
              />
              <Button
                @click="fetchTickets"
                label="Tìm kiếm"
                :loading="queryLoading"
                icon="pi pi-search"
                size="small"
                class="min-w-26"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div class="mt-4">
      <Card>
        <template #content>
          <DataTable
            v-model:expandedRows="expandedRows"
            dataKey="id"
            :value="tickets"
            @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse"
            paginator
            :rows="query.limit"
            :totalRecords="totalRecords"
            @page="onPageChange"
            :lazy="true"
            scrollable
          >
            <Column expander frozen align-frozen="left" />
            <Column
              field="carrier"
              :header="t('carrier')"
              class="text-sm"
              style="min-width: 150px"
            />
            <Column
              field="category"
              :header="t('ticketCategory')"
              class="text-sm"
              style="min-width: 150px"
            >
              <template #body="slotProps">
                {{ categoryMap[slotProps.data.category] }}
              </template>
            </Column>
            <Column field="priority" :header="t('ticketPriority')" style="min-width: 150px">
              <template #body="slotProps">
                <Tag
                  :value="t(slotProps.data.priority)"
                  :severity="priorityMap[slotProps.data.priority]"
                  style="font-size: 12px"
                />
              </template>
            </Column>
            <Column
              field="status"
              :header="t('ticketStatus')"
              class="text-sm"
              style="min-width: 150px"
            >
              <template #body="slotProps">
                <Tag
                  :value="t(slotProps.data.status)"
                  :severity="statusMap[slotProps.data.status]"
                  style="font-size: 12px"
                />
              </template>
            </Column>
            <Column
              field="description"
              :header="t('description')"
              class="text-sm"
              style="min-width: 150px"
            >
              <template #body="slotProps">
                {{ slotProps.data.description }}
              </template>
            </Column>
            <Column
              field="ticketUser"
              :header="t('customer')"
              class="text-sm"
              style="min-width: 150px"
            >
              <template #body="slotProps">
                {{ slotProps.data.ticketUser.name }}
              </template>
            </Column>
            <Column field="slaDueAt" :header="t('sla')" class="text-sm" style="min-width: 150px">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.slaDueAt) }}
              </template>
            </Column>
            <Column
              field="createdAt"
              :header="t('createdAt')"
              class="text-sm"
              style="min-width: 150px"
            >
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.createdAt) }}
              </template>
            </Column>
            <Column :header="t('action')" style="min-width: 150px">
              <template #body="slotProps">
                <Button
                  icon="pi pi-pen-to-square"
                  size="small"
                  variant="text"
                  @click="onAction(slotProps.data)"
                />
              </template>
            </Column>
            <template #expansion="slotProps">
              <div class="p-4 flex flex-col gap-2">
                <span class="font-semibold text-sm text-color">Ghi chú xử lý</span>
                <div class="text-sm">{{ slotProps.data.responseNote || 'Không có ghi chú' }}</div>
              </div>
              <div class="p-4 flex">
                <div class="flex flex-col gap-2 w-full border-r border-surface p-2">
                  <span class="font-semibold text-sm text-color"
                    >Đính kèm của người tạo ticket</span
                  >
                  <div class="flex items-center gap-2 mt-2">
                    <div v-for="item in slotProps.data.ticketAttachments" :key="item.id">
                      <div
                        v-if="item.type === 'image' && item.role === 'CREATOR'"
                        class="w-20 h-20 overflow-hidden border border-surface"
                      >
                        <Image :src="item.url" alt="" preview style="height: 100%; width: 100%" />
                      </div>
                    </div>
                  </div>
                  <div
                    v-for="item in slotProps.data.ticketAttachments"
                    :key="item.id"
                    class="flex flex-col gap-1"
                  >
                    <div
                      v-if="item.type === 'document' && item.role === 'CREATOR'"
                      class="flex items-center gap-1"
                    >
                      <i class="pi pi-file-excel text-emerald-500" />
                      <a
                        :href="item.url"
                        target="_blank"
                        class="text-blue-500 hover:underline text-sm"
                        >{{ item.name }}</a
                      >
                    </div>
                  </div>
                </div>
                <div class="w-full p-2">
                  <span class="font-semibold text-sm text-color"
                    >Đính kèm của người xử lý ticket</span
                  >
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <div v-for="item in slotProps.data.ticketAttachments" :key="item.id">
                        <div
                          v-if="item.type === 'image' && item.role === 'HANDLER'"
                          class="w-20 h-20 overflow-hidden border border-surface"
                        >
                          <Image :src="item.url" alt="" preview style="height: 100%; width: 100%" />
                        </div>
                      </div>
                    </div>
                    <div
                      v-for="item in slotProps.data.ticketAttachments"
                      :key="item.id"
                      class="flex flex-col gap-1"
                    >
                      <div
                        v-if="item.type === 'document' && item.role === 'HANDLER'"
                        class="flex items-center gap-1"
                      >
                        <i class="pi pi-file-excel text-emerald-500" />
                        <a
                          :href="item.url"
                          target="_blank"
                          class="text-blue-500 hover:underline text-sm"
                          >{{ item.name }}</a
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DataTable>
        </template>
      </Card>
    </div>
    <Dialog
      v-model:visible="visible"
      :header="t('handleTicket')"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 text-sm text-color">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('carrier') }}: </span>
            <span>{{ ticket.carrier }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('ticketPriority') }}: </span>
            <Tag :value="t(ticket.priority)" :severity="priorityMap[ticket.priority]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('ticketStatus') }}: </span>
            <Tag :value="t(ticket.status)" :severity="statusMap[ticket.status]" />
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('customer') }}: </span>
            <span>{{ ticket.ticketUser.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('sla') }}: </span>
            <span>{{ formatDateTime(ticket.slaDueAt) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold block">{{ t('createdAt') }}: </span>
            <span>{{ formatDateTime(ticket.createdAt) }}</span>
          </div>
        </div>
        <div class="col-span-2">
          <span class="font-bold block">{{ t('description') }}: </span>
          <span>{{ ticket.description }}</span>
        </div>
        <div class="border-t border-surface pt-4 flex flex-col">
          <FloatLabel variant="on">
            <Select
              inputId="ticketStatus"
              :options="ticketStatus"
              v-model="newState"
              :optionLabel="'label'"
              :optionValue="'value'"
              size="small"
              class="min-w-40"
            />
            <label for="ticketStatus">{{ t('changeTicketState') }}</label>
          </FloatLabel>
        </div>
        <div class="col-span-2">
          <FloatLabel variant="on">
            <Textarea v-model="responseNote" style="font-size: small" fluid />
            <label for="">{{ t('responseNote') }}</label>
          </FloatLabel>
        </div>
        <div class="col-span-2">
          <span class="text-sm font-semibold text-color">{{ t('attachedment') }}</span>
          <div class="mt-2 flex gap-2">
            <input
              ref="imgAttached"
              type="file"
              accept="image/*"
              multiple
              @change="onImageAttchedChange"
              class="hidden"
            />
            <input
              ref="fileAttached"
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              @change="onFileAttchedChange"
              class="hidden"
            />
            <Button
              @click="imgAttached.click()"
              :label="t('imgAttached')"
              icon="pi pi-image"
              size="small"
              outlined
              class="min-w-28"
            />
            <Button
              @click="fileAttached.click()"
              :label="t('excelAttached')"
              icon="pi pi-file-excel"
              size="small"
              outlined
              class="min-w-28"
            />
          </div>
          <div class="flex flex-col col-span-2">
            <div v-if="images.length">
              <span>Hình ảnh</span>
              <div class="mt-2 flex items-center gap-4">
                <div
                  v-for="(img, index) in thumbsnail"
                  :key="index"
                  class="w-48 h-48 overflow-hidden rounded-md border border-surface shadow-md relative"
                >
                  <Button
                    severity="danger"
                    icon="pi pi-trash"
                    size="small"
                    class="imgDelete"
                    @click="removeImage(index)"
                  />
                  <img :src="img.url" alt="" class="w-full object-cover" />
                </div>
              </div>
            </div>
            <div v-if="files.length" class="mt-2">
              <span class="font-medium text-color">Tệp tin</span>
              <div class="mt-1 flex flex-col gap-1">
                <div
                  v-for="(file, index) in files"
                  :key="index"
                  class="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <i class="pi pi-file-excel text-emerald-500" />
                  <span class="text-sm">{{ file.name }}</span>
                  <Button
                    variant="text"
                    severity="danger"
                    rounded
                    icon="pi pi-times"
                    size="small"
                    class="ml-auto"
                    @click="removeFile(index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <Button :label="t('Cancel')" variant="text" @click="visible = false" size="small" />
          <Button
            :label="t('update')"
            @click="updateTicketState"
            :loading="updateLoading"
            size="small"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {
  Card,
  Button,
  Select,
  DataTable,
  Tag,
  Column,
  Image,
  Dialog,
  FloatLabel,
  Textarea,
} from 'primevue'
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { formatDateTime } from '@/utils/helpers'
import {
  categoryMap,
  priorityMap,
  statusMap,
  ticketCategories,
  ticketPriorities,
  ticketStatus,
} from '@/components/view-content/customer/ticket/config'

const { t } = useI18n()

const visible = ref(false)
const tickets = ref([])
const ticket = ref(null)
const customerList = ref([])
const totalRecords = ref(0)
const queryLoading = ref(false)
const expandedRows = ref({})
const query = ref({
  category: null,
  priority: null,
  status: null,
  customer: null,
  page: 1,
  limit: 10,
})

const imgAttached = ref(null)
const fileAttached = ref(null)
const images = ref([])
const thumbsnail = ref([])
const files = ref([])
const responseNote = ref('')
const newState = ref(null)
const updateLoading = ref(false)

const fetchTickets = async () => {
  try {
    queryLoading.value = true
    const response = await api.get('/ticket/get', { params: query.value })
    tickets.value = response.data.tickets
    totalRecords.value = response.data.pagination.count
  } catch (error) {
    toast.error('Lỗi khi tải dữ liệu')
    console.error('Error fetching tickets:', error)
  } finally {
    queryLoading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const response = await api.get('/common/customers')
    customerList.value = response.data.data
  } catch (error) {
    toast.error('Lỗi khi tải dữ liệu khách hàng')
    console.error('Error fetching customers:', error)
  }
}

const onRowExpand = (event) => {}

const onRowCollapse = (event) => {}

const onPageChange = (event) => {
  query.value.page = event.page + 1
  fetchTickets()
}

const queryClear = () => {
  query.value.category = null
  query.value.priority = null
  query.value.status = null
  query.customer = null
  fetchTickets()
}

const onAction = (data) => {
  ticket.value = data
  visible.value = true
}

const onImageAttchedChange = (event) => {
  images.value = Array.from(event.target.files)
  thumbsnail.value = images.value.map((file) => {
    return {
      name: file.name,
      url: URL.createObjectURL(file),
    }
  })
  imgAttached.value.value = ''
}

const onFileAttchedChange = (event) => {
  files.value = Array.from(event.target.files)
  fileAttached.value.value = ''
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  thumbsnail.value.splice(index, 1)
}

const updateTicketState = async () => {
  try {
    const formData = new FormData()
    formData.append('id', ticket.value.id)
    formData.append('status', newState.value)
    formData.append('responseNote', responseNote.value)
    images.value.forEach((image) => {
      formData.append('files', image)
    })
    files.value.forEach((file) => {
      formData.append('files', file)
    })
    const res = await api.post('/ticket/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(res)
  } catch (error) {
    console.log(error)
    toast.error(error.response.data.message || 'Loi khi update ticket')
  }
}

onMounted(() => {
  fetchTickets()
  fetchCustomers()
})
</script>
