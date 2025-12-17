<template>
  <RouterView />
  <Toaster rich-colors position="top-right" />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
