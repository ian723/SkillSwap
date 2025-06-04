<!-- src/views/SwapRequestsView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Swap Requests
      </h1>
    </header>

    <div class="mb-6 flex border-b border-gray-200">
      <button
        @click="setActiveTab('received')"
        :class="[
          'py-3 px-4 sm:px-6 text-sm font-medium focus:outline-none -mb-px',
          activeTab === 'received'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        ]"
      >
        Received
        <span
          v-if="counts.received > 0"
          class="ml-1.5 inline-block py-0.5 px-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
        >
          {{ counts.received }}
        </span>
      </button>
      <button
        @click="setActiveTab('sent')"
        :class="[
          'py-3 px-4 sm:px-6 text-sm font-medium focus:outline-none -mb-px',
          activeTab === 'sent'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        ]"
      >
        Sent
        <span
          v-if="counts.sent > 0"
          class="ml-1.5 inline-block py-0.5 px-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
        >
          {{ counts.sent }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading swap requests...
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
      Could not load swap requests: {{ error.message || error }}
    </div>
    <div
      v-else-if="filteredRequests.length === 0"
      class="text-center py-10 text-gray-500"
    >
      No {{ activeTab }} swap requests found.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Using SwapRequestCard and passing the 'request' prop -->
      <SwapRequestCard
        v-for="reqItem in filteredRequests"
        :key="reqItem.id"
        :request="reqItem"
        :show-actions="shouldShowActions(reqItem)"
        :decline-text="getDeclineButtonText(reqItem)"
        :accept-text="getAcceptButtonText(reqItem)"
        @decline="handleDeclineRequest"
        @accept="handleAcceptRequest"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SwapRequestCard from "@/components/props/SwapRequestCard.vue";

const activeTab = ref("received");
const allRequests = ref([]);
const loading = ref(true);
const error = ref(null);

const counts = computed(() => ({
  received: allRequests.value.filter(
    (r) => r.type === "received" && r.status === "pending"
  ).length,
  sent: allRequests.value.filter((r) => r.type === "sent").length, 
}));

const filteredRequests = computed(() => {
  return allRequests.value.filter(
    (request) => request.type === activeTab.value
  );
});

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const shouldShowActions = (request) => {
  if (request.type === "received" && request.status === "pending") {
    return true;
  }
  if (request.type === "sent" && request.status === "pending") {
    return true;
  }
  return false;
};

const getDeclineButtonText = (request) => {
  if (request.type === "sent" && request.status === "pending") return "Cancel";
  return "Decline";
};
const getAcceptButtonText = (request) => {
  // For sent items, the "accept" button might not make sense, or it could be "View Details"
  // Or, if showActions is true for sent pending, maybe there's only a "Cancel" (declineText) button.
  // Adjust logic based on your exact UX for "sent" items.
  if (request.type === "sent" && request.status === "pending") return "View"; // Example
  return "Accept";
};

const fetchSwapRequests = async () => {
  loading.value = true;
  error.value = null;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
    allRequests.value = [
      // Received Requests Examples
      {
        id: "req1",
        user: {
          id: "user1",
          name: "Oliv Vandesit",
          handle: "Managno",
          avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
          subtitle: "Wants to learn Python",
        },
        skills: ["Cip", "Graname", "Cavis"], // Skills involved in the request
        messageSnippet:
          "Phtorpher expectiso cs. quareom ne.schaimmetnc. Learett annave age. Interested in swapping my Graphic Design skills for your Python tutoring.",
        timestamp: "Just now",
        type: "received",
        status: "pending",
      },
      {
        id: "req2",
        user: {
          id: "user2",
          name: "Enily Devan",
          handle: "Derritingo",
          avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
          subtitle: "Offering Web Development",
        },
        skills: ["Lavel!crnp?", "Panhom"],
        messageSnippet:
          "Lorent ipsum natue wety mimeer.renat. Happy to teach Laravel if you can help me with Panhom.",
        timestamp: "4 hours ago",
        type: "received",
        status: "accepted",
      },
      // Sent Requests Examples
      {
        id: "req3",
        user: {
          id: "user3",
          name: "Aizos Cobater",
          handle: "Mersiting Insam",
          avatarUrl: "https://randomuser.me/api/portraits/women/3.jpg",
          subtitle: "Requested Python help",
        },
        skills: ["Birg", "Python", "TWI"],
        messageSnippet:
          "Bivlings aaphicamently miner cereioct. I saw you offer Python, could you help me with TWI concepts?",
        timestamp: "5 hours ago",
        type: "sent",
        status: "pending",
      },
      {
        id: "req4",
        user: {
          id: "user4",
          name: "Alivia Bedila",
          handle: "Plardooro",
          avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg",
          subtitle: "Asked about Learning",
        },
        skills: ["Learn", "Python"],
        messageSnippet:
          "Er.cant comma larms. niving proderm efficient. Your offer to teach Python is interesting, I would like to learn.",
        timestamp: "4 hours ago",
        type: "sent",
        status: "declined",
      },
    ];
  } catch (e) {
    console.error("Failed to fetch swap requests:", e);
    error.value = e;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSwapRequests();
});

const handleDeclineRequest = async (requestId) => {
  console.log("Declining/Cancelling request ID:", requestId);
  const request = allRequests.value.find((r) => r.id === requestId);
  if (!request) return;
  // --- TODO: API call to backend ---
  // Example: await api.post(`/swap-requests/${requestId}/decline_or_cancel`);
  if (request.type === "received") request.status = "declined";
  else if (request.type === "sent") request.status = "cancelled";
  // --- Then update UI or re-fetch ---
};

const handleAcceptRequest = async (requestId) => {
  const request = allRequests.value.find((r) => r.id === requestId);
  if (!request || request.type === "sent") {
    // Only accept received requests
    console.log(
      "Viewing details for sent request ID (or invalid action):",
      requestId
    );
    // TODO: Navigate to a detailed view if 'View' was clicked for a sent item
    return;
  }
  console.log("Accepting request ID:", requestId);
  // --- TODO: API call to backend ---
  // Example: await api.post(`/swap-requests/${requestId}/accept`);
  request.status = "accepted";
  // --- Then update UI or re-fetch ---
};
</script>
