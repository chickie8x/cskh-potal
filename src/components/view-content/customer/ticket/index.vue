<template>
  <div class="h-full p-4 flex flex-col gap-2 overflow-auto">
    <div class="flex items-center justify-between">
      <span class="text-xl font-semibold text-color">Quản lý ticket</span>
      <Button
        @click="isExpanded = !isExpanded"
        :icon="isExpanded ? 'pi pi-times' : 'pi pi-plus'"
        :label="isExpanded ? 'Đóng' : 'Thêm mới'"
        :severity="!isExpanded ? '' : 'danger'"
        size="small"
        class="min-w-28"
      />
    </div>

    <!-- create ticket section  -->
    <div
      class="mt-4 transition-all duration-300 ease-in-out"
      :class="[isExpanded ? 'py-2 px-1' : 'max-h-0 overflow-hidden']"
    >
      <Card>
        <template #content>
          <Form
            v-slot="$form"
            :initialValues="{
              category: '',
              carrier: '',
              description: '',
              ticketItems: '',
            }"
            :resolver="resolver"
            class="grid grid-cols-2 gap-4"
            @submit="onFormSubmit"
          >
            <Select
              name="category"
              :options="ticketCategories"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn loại ticket"
              value="value"
              size="small"
            />
            <Select
              name="carrier"
              :options="carriers"
              optionLabel="label"
              optionValue="value"
              value="value"
              placeholder="Chọn đơn vị vận chuyển"
              size="small"
            />
            <InputText
              name="ticketItems"
              placeholder="Nhập mã vận đơn, cách nhau dấu phẩy"
              class="col-span-2"
              size="small"
            />
            <Textarea
              name="description"
              placeholder="Mô tả chi tiết"
              class="col-span-2"
              size="small"
            />
            <div class="col-span-2">
              <span class="text-sm text-color font-medium"
                >File đính kèm (tối đa 5 file, mỗi file không quá 5MB)</span
              >
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
                  label="Hình ảnh"
                  icon="pi pi-image"
                  size="small"
                  outlined
                  class="min-w-28"
                />
                <Button
                  @click="fileAttached.click()"
                  label="Excel"
                  icon="pi pi-file-excel"
                  size="small"
                  outlined
                  class="min-w-28"
                />
              </div>
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
            <div class="col-span-2 flex justify-end">
              <Button
                type="submit"
                :loading="createLoading"
                icon="pi pi-check"
                label="Tạo ticket"
                size="small"
              />
            </div>
          </Form>
        </template>
      </Card>
    </div>

    <!-- general info  -->
    <div class="mt-4 flex items-center gap-8">
      <Card v-for="(info, index) in generalInfo" :key="index" class="w-full">
        <template #title>
          <span class="text-sm text-color">{{ info.label }}</span>
        </template>
        <template #content>
          <span class="text-xl font-semibold">{{ info.value }}</span>
        </template>
      </Card>
    </div>

    <!-- search tickets  -->
    <div class="mt-4 py-4 border-y border-surface">
      <Form
        v-slot="$queryForm"
        @submit="onQuerySearch"
        class="flex items-center gap-4 justify-between"
      >
        <Select
          name="queryCategory"
          :options="ticketCategories"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn loại ticket"
          size="small"
          class="w-full"
        />
        <Select
          name="queryStatus"
          :options="ticketStatus"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn trạng thái"
          size="small"
          class="w-full"
        />
        <Select
          name="queryPriority"
          :options="ticketPriorities"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn mức ưu tiên"
          size="small"
          class="w-full"
        />
        <Button
          icon="pi pi-times"
          size="small"
          variant="outlined"
          severity="danger"
          class="min-w-9"
          @click="queryClear($queryForm)"
        />
        <Button
          :loading="queryLoading"
          type="submit"
          icon="pi pi-search"
          label="Tìm kiếm"
          size="small"
          class="min-w-28"
        />
      </Form>
    </div>

    <!-- ticket table  -->
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
          >
            <Column expander />
            <Column field="carrier" header="Đơn vị vận chuyển" class="text-sm" />
            <Column field="category" header="Loại ticket" class="text-sm">
              <template #body="slotProps">
                {{ categoryMap[slotProps.data.category] }}
              </template>
            </Column>
            <Column field="priority" header="Ưu tiên">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.priority"
                  :severity="priorityMap[slotProps.data.priority]"
                  style="font-size: 12px"
                />
              </template>
            </Column>
            <Column field="status" header="Trạng thái" class="text-sm">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.status"
                  :severity="statusMap[slotProps.data.status]"
                  style="font-size: 12px"
                />
              </template>
            </Column>
            <Column field="description" header="Ghi chú" class="text-sm">
              <template #body="slotProps">
                {{ slotProps.data.description }}
              </template>
            </Column>
            <Column field="slaDueAt" header="SLA" class="text-sm">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.slaDueAt) }}
              </template>
            </Column>
            <Column field="createdAt" header="Ngày tạo" class="text-sm">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.createdAt) }}
              </template>
            </Column>
            <template #expansion="slotProps">
              <div class="p-4">
                <div>
                  <span class="font-bold text-sm">Hình ảnh đính kèm</span>
                  <div class="flex items-center gap-4 mt-2">
                    <div v-for="item in slotProps.data.ticketAttachments" :key="item.id">
                      <div
                        v-if="item.type === 'image'"
                        class="w-40 h-40 overflow-hidden border border-surface"
                      >
                        <Image :src="item.url" alt="" preview style="height: 100%; width: 100%" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-8">
                  <span class="font-bold text-sm">File đính kèm</span>
                  <div
                    v-for="item in slotProps.data.ticketAttachments"
                    :key="item.id"
                    class="flex flex-col gap-1"
                  >
                    <div v-if="item.type === 'document'" class="flex items-center gap-1">
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
            </template>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { Button, Card, Select, InputText, Textarea, DataTable, Column, Tag, Image } from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { formatDateTime } from '@/utils/helpers'
import {
  categoryMap,
  priorityMap,
  statusMap,
  ticketCategories,
  carriers,
  ticketPriorities,
  ticketStatus,
} from './config'
import { toast } from 'vue-sonner'

const isExpanded = ref(false)
const imgAttached = ref(null)
const fileAttached = ref(null)
const images = ref([])
const thumbsnail = ref([])
const files = ref([])
const queryLoading = ref(false)
const createLoading = ref(false)
const totalRecords = ref(0)
const query = ref({
  category: null,
  priority: null,
  status: null,
  page: 1,
  limit: 10,
})

const resolver = zodResolver(
  z.object({
    category: z.string().min(1, 'Loại ticket là bắt buộc'),
    carrier: z.string().min(1, 'Đơn vị vận chuyển là bắt buộc'),
    ticketItems: z.string().min(1, 'Mã vận đơn là bắt buộc'),
    description: z.string(),
  }),
)

const onImageAttchedChange = (event) => {
  images.value = Array.from(event.target.files)
  thumbsnail.value = images.value.map((file) => {
    return {
      name: file.name,
      url: URL.createObjectURL(file),
    }
  })
}

const onFileAttchedChange = (event) => {
  files.value = Array.from(event.target.files)
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  thumbsnail.value.splice(index, 1)
}

const onFormSubmit = async ($form) => {
  if (!$form.valid) {
    toast.error('Vui lòng nhập đầy đủ thông tin')
    return
  }

  const formData = new FormData()
  formData.append('category', $form.values.category)
  formData.append('carrier', $form.values.carrier)
  formData.append('ticketItems', $form.values.ticketItems)
  formData.append('description', $form.values.description)
  images.value.forEach((image) => {
    formData.append('files', image)
  })
  files.value.forEach((file) => {
    formData.append('files', file)
  })

  console.log(formData)
  try {
    createLoading.value = true
    const response = await api.post('/customer/ticket/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    await fetchTickets()
  } catch (error) {
    console.error('Error creating ticket:', error)
  } finally {
    createLoading.value = false
  }
}

//general info
const generalInfo = [
  {
    label: 'Mới tạo',
    value: 0,
  },
  {
    label: 'Đang xử lý',
    value: 0,
  },
  {
    label: 'Khẩn cấp',
    value: 0,
  },
  {
    label: 'Hoàn thành hôm nay',
    value: 0,
  },
]

//ticket query search
const onQuerySearch = ($queryForm) => {
  if ($queryForm.values.queryCategory) query.value.category = $queryForm.values.queryCategory
  if ($queryForm.values.queryPriority) query.value.priority = $queryForm.values.queryPriority
  if ($queryForm.values.queryStatus) query.value.status = $queryForm.values.queryStatus
  fetchTickets()
}

const queryClear = ($queryForm) => {
  $queryForm.queryCategory.value = null
  $queryForm.queryPriority.value = null
  $queryForm.queryStatus.value = null
  query.value.category = null
  query.value.priority = null
  query.value.status = null
  fetchTickets()
}

//tickets table
const tickets = ref([])
const expandedRows = ref({})

const fetchTickets = async () => {
  try {
    queryLoading.value = true
    const response = await api.get('/customer/tickets', { params: query.value })
    tickets.value = response.data.data
    totalRecords.value = response.data.pagination.total
  } catch (error) {
    toast.error('Error fetching tickets')
    console.error('Error fetching tickets:', error)
  } finally {
    queryLoading.value = false
  }
}

const onRowExpand = (event) => {}

const onRowCollapse = (event) => {}

const onPageChange = (event) => {
  query.value.page = event.page + 1
  fetchTickets()
}

onMounted(() => {
  fetchTickets()
})
</script>

<style scoped>
.imgDelete {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
