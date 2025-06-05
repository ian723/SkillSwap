<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="text-center py-10">
      <LoadingSpinner message="Loading profile..." />
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
      <ErrorState
        :message="error"
        @action="fetchProfileData"
        action-text="Try Again"
      />
    </div>
    <div
      v-else-if="profileData"
      class="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6"
    >
      <div class="flex items-center space-x-4 mb-6">
        <img
          :src="profileData.avatarUrl || '/default-avatar.png'"
          alt="avatar"
          class="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ profileData.name }}
          </h2>
          <p class="text-gray-600">{{ profileData.email }}</p>
          <button
            v-if="isOwnProfile"
            @click="editing = !editing"
            class="mt-2 px-3 py-1 text-xs sm:text-sm rounded-md text-white font-semibold transition-colors"
            :class="
              editing
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-blue-600 hover:bg-blue-700'
            "
          >
            {{ editing ? "Cancel Edit" : "Edit Profile" }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-700">Bio</h3>
          <p class="text-gray-600 mt-1">
            {{ profileData.bio || "No bio set yet." }}
          </p>
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-700">Location</h3>
          <p class="text-gray-600 mt-1">
            {{ profileData.location || "Not specified." }}
          </p>
        </div>
      </div>

      <form
        v-if="isOwnProfile && editing"
        @submit.prevent="handleUpdateProfile"
        class="mt-6 space-y-4"
      >
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700"
            >Name:</label
          >
          <input id="name" v-model="editForm.name" class="input-style" />
        </div>
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700"
            >Bio:</label
          >
          <textarea
            id="bio"
            v-model="editForm.bio"
            rows="3"
            class="input-style"
          ></textarea>
        </div>
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700"
            >Location:</label
          >
          <input
            id="location"
            v-model="editForm.location"
            class="input-style"
          />
        </div>
        <div>
          <label for="avatarUrl" class="block text-sm font-medium text-gray-700"
            >Avatar URL:</label
          >
          <input
            id="avatarUrl"
            v-model="editForm.avatarUrl"
            class="input-style"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelEdit"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isUpdatingProfile"
            class="btn-primary disabled:opacity-50"
          >
            {{ isUpdatingProfile ? "Saving..." : "Save Changes" }}
          </button>
        </div>
        <p v-if="updateError" class="text-red-500 text-sm mt-2">
          {{ updateError }}
        </p>
      </form>
    </div>
    <div v-else-if="!loading" class="text-center py-10 text-gray-400">
      <p>Profile not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/providers/api/axios";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import ErrorState from "@/components/ui/ErrorState.vue";

const props = defineProps({
  id: { type: String, required: false },
});

const route = useRoute();
const authStore = useAuthStore();

const profileData = ref(null);
const loading = ref(true);
const error = ref(null);
const editing = ref(false);
const isUpdatingProfile = ref(false);
const updateError = ref(null);

const editForm = reactive({
  name: "",
  bio: "",
  location: "",
  avatarUrl: "",
});

const isOwnProfile = computed(() => {
  return authStore.user?.id === profileData.value?.id;
});

const populateEditForm = () => {
  Object.assign(editForm, {
    name: profileData.value?.name || "",
    bio: profileData.value?.bio || "",
    location: profileData.value?.location || "",
    avatarUrl: profileData.value?.avatarUrl || "",
  });
};

const cancelEdit = () => {
  editing.value = false;
  updateError.value = null;
  populateEditForm();
};

const fetchProfileData = async () => {
  loading.value = true;
  error.value = null;

  let userIdToFetch = route.params.id || props.id || authStore.user?.id;

  if (!userIdToFetch && authStore.access_token && !authStore.user) {
    await authStore.fetchUserOnAppLoad();
    userIdToFetch = route.params.id || props.id || authStore.user?.id;
  }

  if (!userIdToFetch) {
    error.value = "Unable to load profile. Please sign in or refresh the page.";
    loading.value = false;
    return;
  }

  try {
    const endpoint =
      userIdToFetch === authStore.user?.id && !route.params.id && !props.id
        ? "/users/me"
        : `/users/${userIdToFetch}`;

    const { data } = await axiosInstance.get(endpoint);
    profileData.value = data;
    if (isOwnProfile.value) populateEditForm();
  } catch (e) {
    const msg =
      e.response?.data?.message ||
      "An error occurred while loading the profile.";
    error.value = msg;
    profileData.value = null;

    if (
      e.response?.status === 401 &&
      !route.params.id &&
      !props.id &&
      authStore.user?.id === userIdToFetch
    ) {
      authStore.logout();
    }
  } finally {
    loading.value = false;
  }
};

const handleUpdateProfile = async () => {
  updateError.value = null;
  isUpdatingProfile.value = true;
  try {
    const { data } = await axiosInstance.put("/users/me", {
      name: editForm.name,
      bio: editForm.bio,
      location: editForm.location,
      avatarUrl: editForm.avatarUrl,
    });
    profileData.value = data;
    editing.value = false;
  } catch (e) {
    updateError.value =
      e.response?.data?.message ||
      "Failed to update profile. Please try again.";
  } finally {
    isUpdatingProfile.value = false;
  }
};

watch(
  () => route.params.id || props.id,
  (newIdSource) => {
    const currentProfileId = profileData.value?.id;
    const targetId = newIdSource || authStore.user?.id;
    if (targetId && (targetId !== currentProfileId || !profileData.value)) {
      fetchProfileData();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.input-style {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.input-style:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
}
.btn-primary {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background-color: #2563eb;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}
.btn-primary:focus {
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.5);
}
</style>
