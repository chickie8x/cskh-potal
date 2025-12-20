<template>
  <div class="h-full p-4 flex flex-col gap-2 overflow-auto">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold text-color">{{ t('addressUtil') }}</h1>
      <span class="text-muted-color text-sm">{{ t('addressUtilDesc') }}</span>
    </div>
    <Tabs value="1" class="flex flex-1 my-tab">
      <TabList>
        <Tab value="1">
          <div class="flex item-center gap-2">
            <i class="pi pi-arrow-right-arrow-left mt-1"></i>
            <span class="text-sm">{{ t('addressConvert') }}</span>
          </div>
        </Tab>
        <Tab value="2">
          <div class="flex item-center gap-2">
            <i class="pi pi-map-marker mt-1"></i>
            <span class="text-sm">{{ t('addressVerify') }}</span>
          </div>
        </Tab>
      </TabList>
      <TabPanels class="flex flex-1">
        <TabPanel value="1" class="w-full">
          <AddressConvert />
        </TabPanel>
        <TabPanel value="2" class="w-full">
          <AddressVerify />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tabs, TabList, TabPanels, TabPanel, Tab } from 'primevue'
import AddressConvert from '@/components/kits/tab-content/AddressConvert.vue'
import AddressVerify from '@/components/kits/tab-content/AddressVerify.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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
