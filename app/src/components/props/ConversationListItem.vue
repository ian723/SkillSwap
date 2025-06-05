<template>
  <button
    @click="$emit('select', conversation.id)"
    class="w-full flex items-center px-3 py-3 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors rounded-lg"
    :class="{ 'bg-gray-100 font-semibold': isActive }"
  >
    <img
      :src="
        conversation.user.avatarUrl ||
        'https://i.pravatar.cc/150?u=' + conversation.user.id
      "
      alt="User avatar"
      class="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 object-cover border"
    />
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-center">
        <h4 class="text-sm sm:text-base font-medium text-gray-800 truncate">
          {{ conversation.user.name }}
        </h4>
        <p class="text-xs text-gray-500 whitespace-nowrap">
          {{ conversation.lastMessageTimestamp }}
        </p>
      </div>
      <p class="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
        {{ conversation.lastMessageSnippet }}
      </p>
      <div
        v-if="conversation.skills && conversation.skills.length"
        class="flex flex-wrap gap-1 mt-1.5"
      >
        <span
          v-for="skill in conversation.skills"
          :key="skill"
          class="bg-gray-200 text-gray-600 text-xxs sm:text-xs font-medium px-1.5 py-0.5 rounded-full"
        >
          {{ skill }}
        </span>
      </div>
    </div>
    <div v-if="conversation.unreadCount > 0" class="ml-2">
      <span
        class="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full"
      >
        {{ conversation.unreadCount }}
      </span>
    </div>
  </button>
</template>

<script setup>
import { defineEmits } from "vue";

defineProps({
  conversation: {
    type: Object,
    required: true,
    default: () => ({
      id: "convoDefault",
      user: {
        id: "userDefault",
        name: "User Name",
        avatarUrl: "",
      },
      skills: [],
      lastMessageSnippet: "Last message preview...",
      lastMessageTimestamp: "10:30 AM",
      unreadCount: 0,
    }),
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select"]);
</script>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
  line-height: 0.85rem;
}
</style>
