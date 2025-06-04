<template>
  <div
    class="flex mb-3 sm:mb-4"
    :class="isSender ? 'justify-end' : 'justify-start'"
  >
    <template v-if="!isSender">
      <div class="flex-shrink-0 mr-2 sm:mr-3">
        <img
          v-if="senderAvatarSrc"
          :src="senderAvatarSrc"
          alt="Avatar"
          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
        />
        <!-- Fallback if senderAvatarSrc couldn't be determined (e.g. no sender.id) -->
        <div
          v-else
          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs"
          title="Sender info missing"
        >
          ?
        </div>
      </div>
    </template>

    <div>
      <div
        class="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg max-w-xs lg:max-w-md xl:max-w-lg"
        :class="
          isSender
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        "
      >
        <p
          v-if="!isSender && senderName"
          class="text-xs font-semibold mb-0.5 text-gray-500"
        >
          {{ senderName }}
        </p>
        <p
          v-else-if="!isSender"
          class="text-xs font-semibold mb-0.5 text-gray-400"
        >
          Unknown Sender
        </p>
        <p class="text-sm leading-relaxed">{{ message.text }}</p>
      </div>
      <p
        class="text-xs text-gray-400 mt-1"
        :class="isSender ? 'text-right' : 'text-left'"
      >
        {{ message.timestamp }}
      </p>
    </div>

    <div
      v-if="isSender && currentUserAvatar"
      class="flex-shrink-0 ml-2 sm:ml-3"
    >
      <img
        :src="currentUserAvatar"
        alt="My Avatar"
        class="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
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
  isSender: {
    type: Boolean,
    default: false,
  },
  currentUserAvatar: {
    type: String,
    default: null,
  },
});

// Pre-calculate sender's name and avatar URL
const senderName = computed(() => {
  return props.message?.sender?.name;
});

const senderAvatarSrc = computed(() => {
  const sender = props.message?.sender;
  if (sender) {
    if (sender.avatarUrl) {
      return sender.avatarUrl;
    }
    if (sender.id) {
      // Fallback to Pravatar only if sender.id exists
      return `https://i.pravatar.cc/150?u=${sender.id}`;
    }
  }
  return null; // Return null if no avatar can be determined
});
</script>
