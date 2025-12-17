<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  form: Object,
})

const emit = defineEmits(['allFieldsHaveValue'])

const requiredFields = [
  'SENDER_ADDRESS',
  'SENDER_FULLNAME',
  'SENDER_PHONE',
  'RECEIVER_FULLNAME',
  'RECEIVER_PHONE',
  'RECEIVER_PROVINCE',
  'RECEIVER_DISTRICT',
  'RECEIVER_WARD',
  'RECEIVER_ADDR',
  'PRODUCT_TYPE',
  'PRODUCT_PRICE',
  'PRODUCT_WEIGHT',
]

const getServicesObj = [
  'SENDER_ADDRESS',
  'PRODUCT_TYPE',
  'PRODUCT_PRICE',
  'PRODUCT_WEIGHT',
  'PRODUCT_LENGTH',
  'PRODUCT_WIDTH',
  'PRODUCT_HEIGHT',
  'TYPE',
  'MONEY_COLLECTION',
]

const obj = ref({})

watch(
  () => requiredFields.map((f) => props.form[f]?.value),
  (values) => {
    const allHaveValue = values.every((v) => v && v !== '')
    if (allHaveValue) {
      triggerAction()
    }
  },
  { deep: true },
)

function triggerAction() {
  getServicesObj.map((f) => {
    obj.value[f] = props.form[f]?.value
  })
  const receiverAddress = `${props.form.RECEIVER_ADDR?.value}, ${props.form.RECEIVER_WARD?.value}, ${props.form.RECEIVER_DISTRICT?.value}, ${props.form.RECEIVER_PROVINCE?.value}`
  obj.value.RECEIVER_ADDRESS = receiverAddress
  obj.value.TYPE = 1
  emit('allFieldsHaveValue', obj.value)
}
</script>

<template></template>
