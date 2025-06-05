// src/store/swapRequest.store.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosInstance from "@/providers/api/axios";
import { useAuthStore } from "./auth.store";

const USERS_API_URL = "/users";
const USER_SKILLS_API_URL = "/user-skills";
const SWAP_REQUESTS_API_URL = "/swap-requests";

export const useSwapRequestStore = defineStore("swapRequest", () => {
  const authStore = useAuthStore();

  const isModalOpen = ref(false);
  const targetUserIdForModal = ref(null); // User ID to pre-fill "To" field

  const isSending = ref(false);
  const error = ref(null);

  const availableUsers = ref([]);
  const currentUserSkills = ref([]); // UserSkillDto[]
  const targetUserSkills = ref([]); // UserSkillDto[]
  const loadingCurrentUserSkills = ref(false);
  const loadingTargetUserSkills = ref(false);

  const teachableCurrentUserSkills = computed(() =>
    currentUserSkills.value.filter((uskill) => uskill.type === "teach")
  );
  const teachableTargetUserSkills = computed(() =>
    targetUserSkills.value.filter((uskill) => uskill.type === "teach")
  );

  async function fetchAllUsersForModal() {
    try {
      const response = await axiosInstance.get(USERS_API_URL);
      availableUsers.value = response.data.filter(
        (u) => u.id !== authStore.user?.id
      );
    } catch (err) {
      console.error("Store: Failed to fetch users for modal:", err);
      error.value = "Could not load users.";
    }
  }

  async function fetchCurrentUserSkillsForModal() {
    if (!authStore.user?.id) return;
    loadingCurrentUserSkills.value = true;
    try {
      const response = await axiosInstance.get(
        `${USER_SKILLS_API_URL}/user/${authStore.user.id}`
      );
      currentUserSkills.value = response.data;
    } catch (err) {
      console.error("Store: Failed to fetch current user skills:", err);
      error.value = "Could not load your skills.";
    } finally {
      loadingCurrentUserSkills.value = false;
    }
  }

  async function fetchTargetSkillsForModal(userId) {
    if (!userId) {
      targetUserSkills.value = [];
      return;
    }
    loadingTargetUserSkills.value = true;
    try {
      const response = await axiosInstance.get(
        `${USER_SKILLS_API_URL}/user/${userId}`
      );
      targetUserSkills.value = response.data;
    } catch (err) {
      console.error("Store: Failed to fetch target user skills:", err);
      targetUserSkills.value = []; // Clear on error
      error.value = "Could not load target user's skills.";
    } finally {
      loadingTargetUserSkills.value = false;
    }
  }

  async function openModal(prefillToUserId = null) {
    error.value = null; // Clear previous errors
    targetUserIdForModal.value = prefillToUserId; // Set target user
    isModalOpen.value = true;

    // Fetch necessary data for the modal
    await Promise.all([
      fetchAllUsersForModal(),
      fetchCurrentUserSkillsForModal(),
    ]);

    if (prefillToUserId) {
      await fetchTargetSkillsForModal(prefillToUserId);
    }
  }

  function closeModal() {
    isModalOpen.value = false;
    targetUserIdForModal.value = null;
    // Reset form related states if they were in the store, but modal has its own local form
    targetUserSkills.value = []; // Clear target skills when modal closes
    error.value = null;
  }

  async function submitNewRequest(formData, fromUserId) {
    if (!fromUserId) {
      error.value = "User not authenticated to send request.";
      return;
    }
    isSending.value = true;
    error.value = null;
    try {
      const payload = {
        fromUserId, // This will be authStore.user.id passed from App.vue
        toUserId: formData.toUserId,
        offeredSkillId: formData.offeredSkillId,
        requestedSkillId: formData.requestedSkillId,
        message: formData.message,
      };
      const response = await axiosInstance.post(SWAP_REQUESTS_API_URL, payload);
      // TODO: Decide how to update the main SwapRequestsView.vue list.
      // Could emit an event, or SwapRequestsView.vue could watch this store,
      // or just re-fetch its list when it becomes active.
      console.log("Store: Swap request sent:", response.data);
      closeModal();
      // alert("Swap request sent successfully!"); // Use a proper notification system
    } catch (err) {
      console.error("Store: Failed to send swap request:", err);
      error.value =
        err.response?.data?.message || "Failed to send swap request.";
    } finally {
      isSending.value = false;
    }
  }

  return {
    isModalOpen,
    targetUserIdForModal, // Used by NewRequestModal to prefill its local formData
    isSending,
    error,
    availableUsers,
    currentUserSkills,
    targetUserSkills,
    loadingCurrentUserSkills,
    loadingTargetUserSkills,
    teachableCurrentUserSkills, // Pass these to modal
    teachableTargetUserSkills, // Pass these to modal
    openModal,
    closeModal,
    submitNewRequest,
    fetchTargetSkillsForModal, // For the modal to call via emit
  };
});
