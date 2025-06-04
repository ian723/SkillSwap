<template>
  <div class="text-center py-10">
    <div
      class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100"
    >
      <svg
        class="h-6 w-6 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 class="mt-2 text-sm font-medium text-gray-900">No data available</h3>
    <p class="mt-1 text-sm text-gray-500">
      {{ message || "There is nothing to display at this time" }}
    </p>
    <div v-if="actionText" class="mt-6">
      <button
        @click="$emit('action')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: "",
  },
  actionText: {
    type: String,
    default: "",
  },
});

defineEmits(["action"]);
</script>
