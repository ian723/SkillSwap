<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header with title and action button -->
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Swap Requests
      </h1>
      <button
        @click="openNewRequestModal"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        New Swap Request
      </button>
    </header>

    <!-- Tab navigation -->
    <div class="mb-6 flex border-b border-gray-200">
      <button
        @click="setActiveTab('received')"
        :class="tabClass('received')"
        data-testid="received-tab"
      >
        Received
        <span v-if="counts.received > 0" :class="badgeClass('received')">
          {{ counts.received }}
        </span>
      </button>
      <button
        @click="setActiveTab('sent')"
        :class="tabClass('sent')"
        data-testid="sent-tab"
      >
        Sent
        <span v-if="counts.sent > 0" :class="badgeClass('sent')">
          {{ counts.sent }}
        </span>
      </button>
    </div>

    <!-- Loading/Error/Empty States -->
    <LoadingSpinner v-if="loading" message="Loading swap requests..." />
    <ErrorState
      v-else-if="error"
      :message="error"
      action-text="Try Again"
      @action="fetchSwapRequests"
    />
    <EmptyState
      v-else-if="filteredRequests.length === 0"
      :message="`No ${activeTab} swap requests found`"
      :action-text="activeTab === 'sent' ? 'Create New Request' : undefined"
      @action="openNewRequestModal"
    />

    <!-- Request Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <SwapRequestCard
        v-for="request in filteredRequests"
        :key="request.id"
        :request="request"
        :show-actions="shouldShowActions(request)"
        :decline-text="getDeclineButtonText(request)"
        :accept-text="getAcceptButtonText(request)"
        :is-processing="processingRequestId === request.id"
        @decline="handleDeclineRequest"
        @accept="handleAcceptRequest"
        @view-details="handleViewDetails"
      />
    </div>

    <!-- New Request Modal -->
    <NewRequestModal
      v-if="showNewRequestModal"
      :sending-request="sendingRequest"
      :new-request-error="newRequestError"
      :available-users="availableUsersForRequest"
      :current-user-skills="teachableCurrentUserSkills"
      :target-user-skills="teachableTargetUserSkills"
      :loading-current-user-skills="loadingCurrentUserSkills"
      :loading-target-user-skills="loadingTargetUserSkills"
      @close="closeModal"
      @submit="handleSubmitFromModal"
      @user-selected="fetchTargetUserSkills"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import SwapRequestCard from "@/components/props/SwapRequestCard.vue";
import NewRequestModal from "@/components/props/NewRequestModal.vue";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import axiosInstance from "@/providers/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "vue-router";

// Constants for API endpoints
const SWAP_REQUESTS_API_URL = "/swap-requests";
const USERS_API_URL = "/users";
const USER_SKILLS_API_URL = "/user-skills";

const authStore = useAuthStore();
const router = useRouter();

// State management
const activeTab = ref("received");
const allRequests = ref([]);
const loading = ref(true);
const error = ref(null);
const processingRequestId = ref(null);

// New request modal state
const showNewRequestModal = ref(false);
const sendingRequest = ref(false);
const newRequestError = ref(null);
const allAvailableUsers = ref([]);
const currentUserSkills = ref([]);
const targetUserSkills = ref([]);
const loadingCurrentUserSkills = ref(false);
const loadingTargetUserSkills = ref(false);

// Form model
const newRequestForm = ref({
  toUserId: "",
  offeredSkillId: "",
  requestedSkillId: "",
  message: "",
});

// Computed properties
const counts = computed(() => {
  if (!authStore.user) return { received: 0, sent: 0 };

  const received = allRequests.value.filter(
    (req) => req.toUser.id === authStore.user.id && req.status === "pending"
  ).length;

  const sent = allRequests.value.filter(
    (req) => req.fromUser.id === authStore.user.id
  ).length;

  return { received, sent };
});

const filteredRequests = computed(() => {
  if (!authStore.user) return [];

  return activeTab.value === "received"
    ? allRequests.value.filter((req) => req.toUser.id === authStore.user.id)
    : allRequests.value.filter((req) => req.fromUser.id === authStore.user.id);
});

const availableUsersForRequest = computed(() =>
  allAvailableUsers.value.filter((user) => user.id !== authStore.user?.id)
);

const teachableCurrentUserSkills = computed(() =>
  currentUserSkills.value.filter((skill) => skill.type === "teach")
);

const teachableTargetUserSkills = computed(() =>
  targetUserSkills.value.filter((skill) => skill.type === "teach")
);

// Tab styling helpers
const tabClass = (tabName) => [
  "py-3 px-4 sm:px-6 text-sm font-medium focus:outline-none -mb-px transition-colors duration-150",
  activeTab.value === tabName
    ? "border-b-2 border-blue-600 text-blue-600"
    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
];

const badgeClass = (tabName) => [
  "ml-1.5 inline-block py-0.5 px-1.5 rounded-full text-xs font-semibold",
  activeTab.value === tabName
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-100 text-gray-700",
];

// Request card helpers
const shouldShowActions = (request) => {
  const isSender = request.fromUser.id === authStore.user.id;
  return (
    request.status === "pending" &&
    (isSender || request.toUser.id === authStore.user.id)
  );
};

const getDeclineButtonText = (request) => {
  return request.fromUser.id === authStore.user.id
    ? "Cancel Request"
    : "Decline";
};

const getAcceptButtonText = () => "Accept";

// Tab management
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// API operations
const fetchSwapRequests = async () => {
  if (!authStore.user) {
    error.value = "Please log in to view swap requests.";
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const [sent, received] = await Promise.all([
      axiosInstance.get(`${SWAP_REQUESTS_API_URL}?type=sent`),
      axiosInstance.get(`${SWAP_REQUESTS_API_URL}?type=received`),
    ]);

    // Merge and deduplicate requests
    const uniqueRequests = new Map();
    [...sent.data, ...received.data].forEach((req) => {
      uniqueRequests.set(req.id, req);
    });

    allRequests.value = Array.from(uniqueRequests.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    handleApiError(err, "Failed to fetch swap requests");
  } finally {
    loading.value = false;
  }
};

const updateRequestStatus = async (requestId, status) => {
  if (processingRequestId.value) return;
  processingRequestId.value = requestId;

  try {
    const response = await axiosInstance.patch(
      `${SWAP_REQUESTS_API_URL}/${requestId}/status`,
      { status }
    );

    // Update request in local state
    const index = allRequests.value.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      allRequests.value.splice(index, 1, response.data);
    }
  } catch (err) {
    handleApiError(err, "Failed to update request status");
  } finally {
    processingRequestId.value = null;
  }
};

// New request modal operations
const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get(USERS_API_URL);
    allAvailableUsers.value = response.data;
  } catch (err) {
    handleApiError(err, "Failed to fetch users");
  }
};

const fetchCurrentUserSkills = async () => {
  if (!authStore.user?.id) return;

  loadingCurrentUserSkills.value = true;
  try {
    const response = await axiosInstance.get(
      `${USER_SKILLS_API_URL}/user/${authStore.user.id}`
    );
    currentUserSkills.value = response.data;
  } catch (err) {
    handleApiError(err, "Failed to fetch your skills");
  } finally {
    loadingCurrentUserSkills.value = false;
  }
};

const fetchTargetUserSkills = async (userId) => {
  if (!userId) return;

  loadingTargetUserSkills.value = true;
  try {
    const response = await axiosInstance.get(
      `${USER_SKILLS_API_URL}/user/${userId}`
    );
    targetUserSkills.value = response.data;
  } catch (err) {
    handleApiError(err, "Failed to fetch user skills");
  } finally {
    loadingTargetUserSkills.value = false;
  }
};

// Event handlers
const handleDeclineRequest = (requestId) => {
  const request = allRequests.value.find((r) => r.id === requestId);
  if (!request) {
    console.error(
      `Cannot find request with ID ${requestId} to decline/cancel.`
    );
    return;
  }

  let statusToSet;
  // Determine if the current user is the sender (initiator) of this request
  const isCurrentUserSender = request.fromUser.id === authStore.user?.id;

  if (isCurrentUserSender && request.status === "pending") {
    statusToSet = "cancelled"; // Sender cancels their own pending request
  } else if (
    request.toUser.id === authStore.user?.id &&
    request.status === "pending"
  ) {
    statusToSet = "declined"; // Receiver declines a pending request
  } else {
    console.warn(
      `Invalid action: Cannot decline/cancel request ${requestId} in status ${request.status} by this user.`
    );
    // Optionally show a user-facing error message here
    // Example: newRequestError.value = "This action cannot be performed on this request.";
    return;
  }

  updateRequestStatus(requestId, statusToSet);
};

const handleAcceptRequest = (requestId) => {
  updateRequestStatus(requestId, "accepted");
};

const handleViewDetails = (requestId) => {
  router.push({ name: "SwapRequestDetail", params: { id: requestId } });
};

const openNewRequestModal = async () => {
  resetNewRequestForm();
  showNewRequestModal.value = true;

  // Fetch data for modal
  await Promise.all([fetchAllUsers(), fetchCurrentUserSkills()]);
};

const closeModal = () => {
  showNewRequestModal.value = false;
  resetNewRequestForm();
  newRequestError.value = null;
};

const resetNewRequestForm = () => {
  newRequestForm.value = {
    toUserId: "",
    offeredSkillId: "",
    requestedSkillId: "",
    message: "",
  };
  targetUserSkills.value = [];
};

const handleSubmitFromModal = async (formDataFromModal) => {
  sendingRequest.value = true;
  newRequestError.value = null;

  const payload = {
    toUserId: formDataFromModal.toUserId,
    offeredSkillId: formDataFromModal.offeredSkillId,
    requestedSkillId: formDataFromModal.requestedSkillId,
    message: formDataFromModal.message,
  };

  try {
    const response = await axiosInstance.post(SWAP_REQUESTS_API_URL, payload);
    allRequests.value.unshift(response.data);
    allRequests.value.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    closeModal();
    if (activeTab.value !== "sent") {
    }
  } catch (err) {
    handleApiError(err, "Failed to send swap request");
  } finally {
    sendingRequest.value = false;
  }
};

// Utility functions
const handleApiError = (error, defaultMessage) => {
  const serverMessage = error.response?.data?.message;
  newRequestError.value = serverMessage || defaultMessage;
  console.error(`${defaultMessage}:`, error);
};

// Lifecycle hooks
onMounted(() => {
  if (authStore.user) {
    fetchSwapRequests();
  } else {
    // Wait for authentication if needed
    const unwatch = watch(
      () => authStore.user,
      (user) => {
        if (user) {
          fetchSwapRequests();
          unwatch();
        }
      }
    );
  }
});
</script>
