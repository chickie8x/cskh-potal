<template>
  <div class="h-screen flex">
    <div class="w-1/2 h-full relative">
      <img src="/images/login-splash.avif" class="h-full w-full object-cover" alt="" />
      <div class="absolute inset-0 bg-black opacity-50"></div>
    </div>
    <div class="w-1/2 h-full bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
      <div class="bg-surface-0 dark:bg-surface-900 shadow-sm p-8 w-[400px] rounded-md">
        <div class="pb-4 flex items-center justify-center">
          <span class="text-primary font-bold text-2xl">Sign In</span>
        </div>
        <Form
          v-slot="$form"
          :initialValues="{ email: '', password: '' }"
          :resolver="resolver"
          @submit="login"
          class="flex flex-col gap-4 w-full"
        >
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
            <Message
              v-if="$form.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $form.password.error?.message }}</Message
            >
          </div>
          <div class="py-2 flex items-center justify-between text-sm">
            <Checkbox v-model="remember" id="remember" name="remember" size="small" binary />
            <label for="remember" class="ml-1">Remember me</label>
            <span class="block ml-auto hover:underline hover:text-primary cursor-pointer"
              >Forgot Password?</span
            >
          </div>
          <Button type="submit" severity="primary" label="Submit" />
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import FloatLabel from 'primevue/floatlabel'
import Checkbox from 'primevue/checkbox'
import { z } from 'zod'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/store/authstore'
import { useRouter } from 'vue-router'

const authstore = useAuthStore()
const passwordVisible = ref(false)
const remember = ref(false)
const router = useRouter()

const login = async ($form) => {
  console.log($form)
  if (!$form.valid) {
    toast.error('Email and password are required')
    return
  }
  try {
    const res = await api.post('/auth/login', $form.values)
    authstore.setAccessToken(res.data.data.token)
    authstore.setRefreshToken(res.data.data.refreshToken)
    authstore.setUserAddress(res.data.data.address)
    router.push({ name: 'Dashboard' })
  } catch (error) {
    console.log(error)
  }
}

const resolver = ref(
  zodResolver(
    z.object({
      email: z
        .string()
        .min(1, 'Email is required')
        .max(255, 'Email must be at most 255 characters long'),
      password: z
        .string()
        .min(1, 'Password is required')
        .max(255, 'Password must be at most 255 characters long'),
    }),
  ),
)

const toggleShowPassword = () => {
  passwordVisible.value = !passwordVisible.value
}
</script>
