<template>
  <div class="text-center py-10 bg-red-50 p-4 rounded-md">
    <div
      class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
    >
      <svg
        class="h-6 w-6 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h3 class="mt-2 text-sm font-medium text-red-800">Could not load data</h3>
    <p class="mt-1 text-sm text-red-700">
      {{ message || "An unexpected error occurred" }}
    </p>
    <div v-if="actionText" class="mt-4">
      <button
        @click="$emit('action')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    default: "Try Again",
  },
});

defineEmits(["action"]);
</script>
