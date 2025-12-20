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
          <SingleOrderCreate />
        </TabPanel>
        <TabPanel value="2">
          <BatchOrderCreate />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { Tabs, TabPanel, TabPanels, TabList, Tab } from 'primevue'
import SingleOrderCreate from '../../tab-content/SingleOrderCreate.vue'
import BatchOrderCreate from '../../tab-content/BatchOrderCreate.vue'
import { useI18n } from 'vue-i18n';

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
