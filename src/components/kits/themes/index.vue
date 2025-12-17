<template>
  <div class="flex items-center gap-1">
    <!-- Light Icon -->
    <i
      class="pi pi-sun text-xl transition-all duration-300"
      :class="[
        isDark ? 'opacity-50 scale-90' : 'opacity-100 scale-110 text-yellow-400 drop-glow-light',
      ]"
    ></i>

    <!-- ToggleSwitch -->
    <ToggleSwitch
      :modelValue="isDark"
      @update:modelValue="toggleDark()"
      class="theme-toggle"
      size="small"
    />

    <!-- Dark Icon -->
    <i
      class="pi pi-moon text-xl transition-all duration-300"
      :class="[
        isDark ? 'opacity-100 scale-110 text-purple-400 drop-glow-dark' : 'opacity-50 scale-90',
      ]"
    ></i>
  </div>
</template>

<script setup>
import ToggleSwitch from 'primevue/toggleswitch'
import { useDark, useToggle } from '@vueuse/core'
import { usePrimeVue } from 'primevue'

const primevue = usePrimeVue()

// VueUse Dark Mode
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'my-app-dark',
  valueLight: '',
})

const toggleDark = useToggle(isDark)
</script>

<style scoped>
/* Smooth transition cho toàn site */
:global(html) {
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
}

/* Glow Icons */
.drop-glow-light {
  filter: drop-shadow(0 0 6px rgba(255, 200, 0, 0.6));
}

.drop-glow-dark {
  filter: drop-shadow(0 0 6px rgba(150, 100, 255, 0.6));
}

/* PrimeVue ToggleSwitch Custom */
.theme-toggle .p-toggleswitch-slider {
  transition: all 0.3s ease;
  border-radius: 999px;
}

/* Dark Mode slider màu tím */
.theme-toggle.p-toggleswitch-checked .p-toggleswitch-slider {
  background-color: #7c3aed !important; /* Purple */
}

/* Light Mode slider màu vàng */
.theme-toggle .p-toggleswitch-slider {
  background-color: #facc15 !important; /* Yellow */
}
</style>
