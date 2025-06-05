<template>
  <div class="bg-white shadow-md p-6 rounded-2xl text-center space-y-2">
    <div class="text-4xl">{{ icon }}</div>
    <h3 class="text-xl font-semibold text-indigo-700">{{ title }}</h3>
    <p class="text-gray-600">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  text: String,
});
</script>
