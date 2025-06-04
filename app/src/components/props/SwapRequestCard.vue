<template>
  <div
    class="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div class="flex items-start mb-4">
      <img
        :src="
          request.user.avatarUrl ||
          'https://i.pravatar.cc/150?u=' + request.user.id
        "
        alt="User avatar"
        class="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-4 object-cover border"
      />
      <div class="flex-1">
        <div class="flex justify-between items-center">
          <h3 class="text-md sm:text-lg font-semibold text-gray-800">
            {{ request.user.name }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {{ request.timestamp }}
          </p>
        </div>
        <p class="text-sm text-gray-500 mb-1">
          {{ request.user.handle || request.user.subtitle }}
        </p>
        <div
          v-if="request.skills && request.skills.length"
          class="flex flex-wrap gap-1 my-2"
        >
          <span
            v-for="skill in request.skills"
            :key="skill"
            class="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-700 leading-relaxed mb-4">
      {{ request.messageSnippet }}
    </p>

    <div v-if="showActions" class="flex justify-end space-x-3">
      <button
        @click="handleDecline"
        class="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        {{ declineText }}
      </button>
      <button
        @click="handleAccept"
        class="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {{ acceptText }}
      </button>
    </div>
    <div v-else-if="request.status" class="text-right">
      <span
        :class="{
          'text-green-600': request.status === 'accepted',
          'text-red-600':
            request.status === 'declined' || request.status === 'cancelled',
          'text-yellow-600': request.status === 'pending_other',
        }"
        class="text-sm font-semibold"
      >
        {{ formattedStatus }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  request: {
    type: Object,
    required: true,
    default: () => ({
      id: "reqDefault",
      user: {
        id: "userDefault",
        name: "User Name",
        handle: "@username",
        avatarUrl: "",
        subtitle: "Role or brief info",
      },
      skills: ["Skill Offered", "Skill Requested"],
      messageSnippet:
        "A brief snippet of the swap request message goes here, detailing the proposed exchange...",
      timestamp: "X hours ago",
      type: "received",
      status: "pending",
    }),
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  declineText: {
    type: String,
    default: "Decline",
  },
  acceptText: {
    type: String,
    default: "Accept",
  },
});

const emit = defineEmits(["decline", "accept"]);

const handleDecline = () => {
  emit("decline", props.request.id);
};

const handleAccept = () => {
  emit("accept", props.request.id);
};

const formattedStatus = computed(() => {
  if (!props.request.status) return "";
  switch (props.request.status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "pending_other":
      return "Pending Other Party";
    case "pending":
      return "Pending Your Action";
    default:
      return (
        props.request.status.charAt(0).toUpperCase() +
        props.request.status.slice(1)
      );
  }
});
</script>
