<template>
  <div class="p-4 h-full overflow-auto">
    <div class="flex justify-between">
      <span class="text-xl text-color font-bold">Quản lý người dùng</span>
      <Button
        @click="isExpanded = !isExpanded"
        :icon="isExpanded ? 'pi pi-times' : 'pi pi-plus'"
        :label="isExpanded ? 'Huỷ' : 'Tạo user'"
        :severity="isExpanded ? 'danger' : ''"
        size="small"
        class="min-w-26"
      />
    </div>
    <!-- create user form -->
    <div
      class="mt-4 transition-all duration-300 ease-in-out"
      :class="[isExpanded ? 'py-2 px-1' : 'max-h-0 overflow-hidden']"
    >
      <Card>
        <template #title>
          <div class="flex items-center gap-1">
            <i class="pi pi-user-plus"></i>
            <span class="text-sm text-color font-semibold">Tạo user</span>
          </div>
        </template>
        <template #content>
          <Form
            v-slot="$form"
            :initialValues="{ email: '', password: '', confirmPassword: '', role: '', status: '' }"
            :resolver="resolver"
            @submit="createUser"
            class="flex gap-2"
          >
            <div class="w-full flex flex-col gap-2">
              <div>
                <IconField>
                  <InputIcon class="pi pi-user" />
                  <InputText name="email" placeholder="email" size="small" fluid />
                </IconField>
                <Message
                  v-if="$form.email?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.email.error?.message }}</Message
                >
              </div>
              <div>
                <IconField>
                  <InputIcon class="pi pi-phone" />
                  <InputText name="phone" placeholder="phone" size="small" fluid />
                </IconField>
                <Message
                  v-if="$form.phone?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.phone.error?.message }}</Message
                >
              </div>
              <div>
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <Password name="password" placeholder="password" size="small" toggleMask fluid />
                </IconField>
                <Message
                  v-if="$form.password?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.password.error?.message }}</Message
                >
              </div>
              <div>
                <IconField>
                  <InputIcon class="pi pi-lock" />
                  <Password
                    name="confirmPassword"
                    placeholder="confirm password"
                    size="small"
                    toggleMask
                    fluid
                  />
                </IconField>
                <Message
                  v-if="$form.confirmPassword?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.confirmPassword.error?.message }}</Message
                >
              </div>
            </div>
            <div class="w-full flex flex-col gap-2">
              <div>
                <IconField>
                  <InputIcon class="pi pi-id-card" />
                  <InputText name="name" placeholder="name" size="small" fluid />
                </IconField>
              </div>
              <div>
                <Select
                  name="role"
                  :options="roles"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Role"
                  size="small"
                  fluid
                />
                <Message
                  v-if="$form.role?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.role.error?.message }}</Message
                >
              </div>
              <div>
                <Select
                  name="status"
                  :options="status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Status"
                  size="small"
                  fluid
                />
                <Message
                  v-if="$form.status?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  >{{ $form.status.error?.message }}</Message
                >
              </div>
              <div class="flex gap-2 justify-end">
                <Button
                  label="Xóa thông tin"
                  size="small"
                  @click="clearForm($form)"
                  class="min-w-26"
                  variant="outlined"
                  severity="danger"
                />
                <Button type="submit" label="Tạo user" size="small" class="min-w-26" />
              </div>
            </div>
          </Form>
        </template>
      </Card>
    </div>

    <div>
      <Card>
        <template #title>
          <div class="flex items-center gap-1">
            <i class="pi pi-user"></i>
            <span class="text-sm text-color font-semibold">Danh sách user</span>
          </div>
        </template>
        <template #content>
          <div>
            <DataTable :value="users" :sortField="'role'" :sortOrder="1">
              <Column v-for="column in columns" :key="column.field" :field="column.field">
                <template #header>
                  <span class="text-sm text-color font-semibold">{{ column.header }}</span>
                </template>
                <template #body="slotProps">
                  <span v-if="column.field === 'createdAt'" class="text-sm text-color">
                    {{ formatDate(slotProps.data[column.field]) }}
                  </span>
                  <span
                    v-else
                    class="text-sm text-color"
                    :class="[
                      column.style,
                      column.field === 'status' || column.field === 'role' ? 'text-xs' : '',
                    ]"
                    >{{ slotProps.data[column.field] }}</span
                  >
                </template>
              </Column>
              <Column>
                <template #header>
                  <span class="text-sm text-color font-semibold">Action</span>
                </template>
                <template #body="slotProps">
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      class="mr-2"
                      variant="outlined"
                      severity="info"
                      @click="editUser(slotProps.data)"
                    ></Button>
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      variant="outlined"
                      severity="danger"
                      @click="deleteUser(slotProps.data)"
                    ></Button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  DataTable,
  Column,
  Button,
  Card,
  IconField,
  InputIcon,
  InputText,
  Password,
  Select,
  Message,
  Divider,
} from 'primevue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import z from 'zod'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { formatDate } from '@/utils/helpers'

const resolver = zodResolver(
  z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    name: z.string().min(1, { message: 'Name không hợp lệ' }),
    phone: z.string().min(1, { message: 'Phone không hợp lệ' }),
    password: z
      .string()
      .min(8, { message: 'Mật khẩu từ 8 ký tự trở lên' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          'Mật khẩu từ 8 ký tự trở lên , chứa chữ hoa , thường , số và ít nhất 1 ký tự đặc biệt',
      }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Mật khẩu từ 8 ký tự trở lên' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          'Mật khẩu từ 8 ký tự trở lên , chứa chữ hoa , thường , số và ít nhất 1 ký tự đặc biệt',
      }),
    role: z.string().min(1, { message: 'Role không hợp lệ' }),
    status: z.string().min(1, { message: 'Status không hợp lệ' }),
  }),
)

const isExpanded = ref(false)
const users = ref([])
const columns = ref([
  { field: 'email', header: 'Email', style: 'font-semibold' },
  { field: 'phone', header: 'Phone', style: '' },
  { field: 'name', header: 'Name', style: '' },
  { field: 'role', header: 'Role', style: '' },
  { field: 'status', header: 'Status', style: '' },
  { field: 'createdAt', header: 'Created at', style: '' },
])
const roles = ref([
  { label: 'Admin', value: 'ADMIN' },
  { label: 'CS', value: 'CS_STAFF' },
  { label: 'Customer', value: 'CUSTOMER' },
])
const status = ref([
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
])

const query = ref({
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
})

const getUsers = async () => {
  try {
    const response = await api.get('/admin/get-users', { params: query.value })
    users.value = response.data.users
  } catch (error) {
    console.log(error)
    toast.error('Lỗi khi lấy danh sách user')
  }
}

const createUser = async ($form) => {
  if (!$form.valid) {
    toast.error('Vui lòng nhập đầy đủ và đúng thông tin')
    return
  }

  if ($form.values.password !== $form.values.confirmPassword) {
    toast.error('Mật khẩu không khớp')
    return
  }

  const data = $form.values

  try {
    const response = await api.post('/admin/create-user', data)
    toast.success('Tạo user thành công')
    getUsers()
    clearForm($form)
  } catch (err) {
    console.log(err)
    toast.error('Lỗi khi tạo user')
  }
}

const clearForm = ($form) => {
  $form.reset()
}

const editUser = async (user) => {
  console.log(user)
}

const deleteUser = async (user) => {
  const result = confirm('Bạn có chắc chắn muốn xóa user này?')
  if (result) {
    await api.delete(`/admin/delete-user`, { data: { userId: user.id } })
    toast.success('Xóa user thành công')
    getUsers()
  } else {
    return
  }
}

onMounted(() => {
  getUsers()
})
</script>
