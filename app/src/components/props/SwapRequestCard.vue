<!-- src/components/SwapRequestCard.vue -->
<template>
  <div
    class="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
  >
    <!-- ... (Request Content remains the same) ... -->
    <div>
      <!-- Top: User Info and Timestamp -->
      <div class="flex items-start mb-3">
        <img
          :src="
            partnerInRequest.avatarUrl ||
            'https://i.pravatar.cc/150?u=' + partnerInRequest.id
          "
          alt="User avatar"
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-3 object-cover border"
        />
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h3
              class="text-md sm:text-lg font-semibold text-gray-800 truncate pr-2"
            >
              {{ partnerInRequest.name }}
            </h3>
            <p
              class="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0"
            >
              {{ formattedTimestamp }}
            </p>
          </div>
          <p v-if="requestType === 'received'" class="text-xs text-gray-500">
            Sent you a request
          </p>
          <p v-if="requestType === 'sent'" class="text-xs text-gray-500">
            You sent a request
          </p>
        </div>
      </div>
      <!-- Skills Offered and Requested -->
      <div class="mb-3 text-sm">
        <div class="mb-1">
          <span class="font-medium text-gray-700">Offering:</span>
          <span class="ml-1 text-blue-600">{{
            request.offeredSkill.name
          }}</span>
        </div>
        <div>
          <span class="font-medium text-gray-700">Requesting:</span>
          <span class="ml-1 text-green-600">{{
            request.requestedSkill.name
          }}</span>
        </div>
      </div>
      <!-- Optional Message -->
      <p
        v-if="request.message"
        class="text-sm text-gray-600 leading-relaxed mb-4 p-2 bg-gray-50 rounded-md border border-gray-200 max-h-20 overflow-y-auto"
      >
        {{ request.message }}
      </p>
      <p v-else class="text-sm text-gray-500 italic mb-4">
        No message included.
      </p>
    </div>

    <!-- Bottom: Actions or Status -->
    <div class="mt-auto pt-3">
      <!-- Action Buttons -->
      <div
        v-if="isPending"
        class="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0"
      >
        <!-- For RECEIVED PENDING requests: Decline / Accept -->
        <template v-if="requestType === 'received'">
          <button
            @click="handleDecline"
            :disabled="isProcessing"
            class="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Decline
          </button>
          <button
            @click="handleAccept"
            :disabled="isProcessing"
            class="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Accept
          </button>
        </template>

        <!-- For SENT PENDING requests: Cancel Request -->
        <template v-if="requestType === 'sent'">
          <button
            @click="handleDecline"
            :disabled="isProcessing"
            class="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel Request
          </button>
          <!-- Optionally, a "View Details" button for sent items if it leads somewhere -->
          <!-- <button @click="handleViewDetails" class="w-full sm:w-auto ...">View Details</button> -->
        </template>
      </div>

      <!-- If not pending, show status badge -->
      <div v-else-if="request.status" class="text-right">
        <span
          :class="statusClass"
          class="text-sm font-semibold px-2 py-1 rounded-full"
          :style="{ backgroundColor: statusColorMap[request.status] + '20' }"
        >
          {{ formattedStatus }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { useAuthStore } from "@/store/auth.store";

const props = defineProps({
  request: { type: Object, required: true },
  // showActions, declineText, acceptText are no longer needed as props here
  // if the card manages its own button display logic.
  // If parent still needs to override, keep them. For this solution, I'm removing them.
  isProcessing: { type: Boolean, default: false },
});

const emit = defineEmits(["decline", "accept", "view-details"]);
const authStore = useAuthStore();

const requestType = computed(() => {
  if (!props.request || !authStore.user) return "unknown";
  return props.request.fromUser.id === authStore.user.id ? "sent" : "received";
});

const partnerInRequest = computed(() => {
  if (!props.request || !authStore.user)
    return { name: "User", id: "unknown", avatarUrl: "" };
  return requestType.value === "sent"
    ? props.request.toUser
    : props.request.fromUser;
});

const formattedTimestamp = computed(() => {
  if (!props.request.createdAt) return "";
  return new Date(props.request.createdAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
});

const statusColorMap = {
  pending: "#FBBF24", // amber-400
  accepted: "#10B981", // green-500
  declined: "#EF4444", // red-500
  completed: "#3B82F6", // blue-500
  cancelled: "#71717A", // zinc-500 (Added 'cancelled' for sender's action)
};

const formattedStatus = computed(() => {
  if (!props.request.status) return "";
  const s = props.request.status;
  return s.charAt(0).toUpperCase() + s.slice(1);
});

const statusClass = computed(() => {
  return {
    "text-green-600":
      props.request.status === "accepted" ||
      props.request.status === "completed",
    "text-red-600":
      props.request.status === "declined" ||
      props.request.status === "cancelled",
    "text-yellow-600": props.request.status === "pending",
  };
});

const isPending = computed(() => props.request.status === "pending");

// Emit 'decline' (which parent will map to 'declined' or 'cancelled' API call)
const handleDecline = () => {
  emit("decline", props.request.id);
};

// Emit 'accept' (only for received)
const handleAccept = () => {
  if (requestType.value === "received") {
    emit("accept", props.request.id);
  }
};

// const handleViewDetails = () => { // If you have a view details button
//   emit("view-details", props.request.id);
// };
</script>
