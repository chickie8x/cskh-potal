<template>
  <div>
    <Form
      v-slot="$form"
      :initialValues="{ email: '', password: '' }"
      :resolver="resolver"
      @submit="connect"
      class="flex flex-col gap-4 w-full"
    >
      <Select
        name="carrier"
        optionLabel="name"
        optionValue="value"
        :options="carriers"
        placeholder="Chọn đối tác vận chuyển"
        class="min-w-64"
      />
      <div class="flex flex-col gap-1">
        <FloatLabel variant="on">
          <IconField name="email">
            <InputIcon class="pi pi-envelope" />
            <InputText id="email" name="email" type="text" fluid />
          </IconField>
          <label for="email">Email</label>
        </FloatLabel>

        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
          $form.email.error?.message
        }}</Message>
      </div>
      <div class="flex flex-col gap-1">
        <FloatLabel variant="on">
          <IconField name="password">
            <InputIcon class="pi pi-lock" />
            <InputText
              id="password"
              name="password"
              :type="passwordVisible ? 'text' : 'password'"
              fluid
            />
            <InputIcon
              :class="!passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"
              @click="toggleShowPassword"
            />
          </IconField>
          <label for="password">Password</label>
        </FloatLabel>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
          $form.password.error?.message
        }}</Message>
      </div>
      <Button type="submit" severity="primary" label="Đăng nhập" />
    </Form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Form } from '@primevue/forms'
import { Select, InputText, InputIcon, IconField, FloatLabel, Button, Message } from 'primevue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

const emit = defineEmits(['connect'])
const passwordVisible = ref(false)
const carriers = ref([
  {
    name: 'Viettel Post',
    value: 'VIETTEL_POST',
  },
])
const toggleShowPassword = () => {
  passwordVisible.value = !passwordVisible.value
}

const resolver = ref(
  zodResolver(
    z.object({
      carrier: z.string().min(1, 'Đối tác vận chuyển is required'),
      email: z.string().min(1, 'Email is required'),
      password: z.string().min(1, 'Password is required'),
    }),
  ),
)

const connect = async ($form) => {
  try {
    const data = {
      carrier: $form.values.carrier,
      username: $form.values.email,
      password: $form.values.password,
    }
    const response = await api.post('connector/viettelpost/customer-token/create', data)
    emit('connect', response.data)
  } catch (error) {
    console.error(error)
    toast.error(error.response.data.message || 'Lỗi kết nối')
  }
}
</script>
