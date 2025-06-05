<template>
  <div
    class="flex items-end mb-4 gap-2 sm:gap-3"
    :class="isSender ? 'justify-end' : 'justify-start'"
  >
    <!-- Left-side Avatar for others -->
    <template v-if="!isSender">
      <div class="flex-shrink-0">
        <img
          v-if="senderAvatarSrc"
          :src="senderAvatarSrc"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs"
          title="Sender info missing"
        >
          ?
        </div>
      </div>
    </template>

    <!-- Message Bubble -->
    <div class="flex flex-col max-w-[80%] sm:max-w-md">
      <div
        class="px-4 py-2.5 rounded-lg"
        :class="
          isSender
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        "
      >
        <p
          v-if="!isSender && senderName"
          class="text-xs font-semibold text-gray-500 mb-1"
        >
          {{ senderName }}
        </p>
        <p class="text-sm break-words leading-snug">{{ message.text }}</p>
      </div>
      <p
        class="text-[11px] text-gray-400 mt-1 px-1"
        :class="isSender ? 'text-right' : 'text-left'"
      >
        {{ message.timestamp }}
      </p>
    </div>

    <!-- Right-side Avatar for current user -->
    <div v-if="isSender && currentUserAvatar" class="flex-shrink-0">
      <img
        :src="currentUserAvatar"
        alt="My Avatar"
        class="w-8 h-8 rounded-full object-cover"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
    default: () => ({
      id: "msgDefault",
      text: "This is a chat message.",
      timestamp: "10:32 AM",
      sender: {
        id: "senderId",
        name: "Sender Name",
        avatarUrl: null,
      },
    }),
  },
  isSender: Boolean,
  currentUserAvatar: String,
});

const senderName = computed(() => props.message?.sender?.name || null);
const senderAvatarSrc = computed(
  () => props.message?.sender?.avatarUrl || null
);
</script>
