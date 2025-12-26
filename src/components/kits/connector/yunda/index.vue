<template>
  <div>
    <Tabs value="1">
      <TabList>
        <Tab value="1" as="div" class="flex items-center gap-1">
          <i class="pi pi-file-check"></i>
          {{ t('singleOrder') }}
        </Tab>
        <Tab value="2" as="div" class="flex items-center gap-1">
          <i class="pi pi-list-check"></i>
          {{ t('batchOrder') }}
        </Tab>
      </TabList>
      <TabPanels class="mt-4">
        <TabPanel value="1">
          <YundaSingleCreate />
        </TabPanel>
        <TabPanel value="2">
          <YundaBatchCreate />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { MD5 } from 'crypto-js'
import { useI18n } from 'vue-i18n'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import YundaSingleCreate from '@/components/kits/tab-content/YundaSingleCreate.vue'
import YundaBatchCreate from '@/components/kits/tab-content/YundaBatchCreate.vue'

const { t } = useI18n()

const appKey = '999999'
const appSecret = '04d4ad40eeec11e9bad2d962f53dda9d'
const url = 'https://u-openapi.yundasys.com/openapi-api/v1/order/pushOrder'
const order = ref({
  appid: appKey,
  orderid: '92873592735',
  backparam: '散单测试',
  backurl: 'https://www.google.com',
  freight: 10,
  items: [
    {
      name: '衣服',
      number: 1,
      remark: '袜子',
    },
  ],
  other_charges: 0,
  premium: 1,
  receiver: {
    address: '青浦区盈港东路 6679 号',
    city: '上海市',
    company: '',
    county: '青浦区',
    mobile: '17601205970',
    name: '李四',
    phone: '',
    postcode: 'string',
    province: '上海市',
  },
  remark: 'string',
  sendendtime: '2019-09-03 11:00:00',
  sender: {
    address: '盈港东路 7766 号',
    city: '上海市',
    company: 'string',
    county: '青浦区',
    mobile: '17601205970',
    name: '张三',
    phone: '',
    postcode: '',
    province: '上海市',
  },
  sendstarttime: '2019-09-03 10:00:00',
  size: '0.12,0.23,0.11',
  special: 0,
  value: 126.5,
  weight: 0,
})

const result = ref({})

const createOrder = async () => {
  const requestBody = JSON.stringify(order.value)
  const signString = `${requestBody}_${appSecret}`
  const sign = MD5(signString).toString()

  console.log('Request Body:', requestBody)
  console.log('Sign String:', signString)
  console.log('Generated Sign:', sign)

  const res = await axios.post(url, requestBody, {
    headers: {
      'Content-Type': 'application/json',
      'app-key': appKey,
      sign: sign,
      'req-time': new Date().getTime(),
    },
  })
  result.value = res.data
}
</script>

<style scoped>
.p-tablist {
  background: transparent;
}
.p-tabpanels {
  background: transparent;
  padding: 0;
}
</style>
