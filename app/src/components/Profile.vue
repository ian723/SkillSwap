<template>
  <div class="container mx-auto p-4">
    <!-- Loading State -->
    <div
      v-if="usersStore.profileData.loading && !usersStore.profileData.data"
      class="text-center py-10"
    >
      <p>Loading profile...</p>
      <!-- Spinner could go here -->
    </div>

    <!-- Error State -->
    <div
      v-else-if="usersStore.profileData.error"
      class="text-center py-10 text-red-500"
    >
      Error loading profile: {{ usersStore.profileData.error }}
    </div>

    <!-- Profile Display -->
    <div
      v-else-if="profile"
      class="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6"
    >
      <!-- Avatar & Basic Info -->
      <div class="flex items-center space-x-4 mb-6">
        <img
          :src="profile.avatarUrl || '/default-avatar.png'"
          alt="avatar"
          class="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ profile.name }}
          </h2>
          <p class="text-gray-600">{{ profile.email }}</p>
        </div>
      </div>

      <!-- Bio and Location -->
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-700">Bio</h3>
          <p class="text-gray-600 mt-1">
            {{ profile.bio || "No bio set yet." }}
          </p>
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-700">Location</h3>
          <p class="text-gray-600 mt-1">
            {{ profile.location || "Not specified." }}
          </p>
        </div>
      </div>

      <!-- Toggle Edit Button -->
      <button
        @click="toggleEditMode"
        class="mt-6 w-full sm:w-auto px-4 py-2 rounded-md text-white font-semibold transition-colors"
        :class="
          editing
            ? 'bg-gray-500 hover:bg-gray-600'
            : 'bg-blue-600 hover:bg-blue-700'
        "
      >
        {{ editing ? "Cancel" : "Edit Profile" }}
      </button>

      <!-- Edit Form -->
      <form
        v-if="editing"
        @submit.prevent="handleUpdateProfile"
        class="mt-6 space-y-4"
      >
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700"
            >Name:</label
          >
          <input
            id="name"
            v-model="form.name"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700"
            >Bio:</label
          >
          <textarea
            id="bio"
            v-model="form.bio"
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          ></textarea>
        </div>

        <!-- Location -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700"
            >Location:</label
          >
          <input
            id="location"
            v-model="form.location"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <!-- Avatar URL -->
        <div>
          <label for="avatarUrl" class="block text-sm font-medium text-gray-700"
            >Avatar URL (optional):</label
          >
          <input
            id="avatarUrl"
            v-model="form.avatarUrl"
            placeholder="https://example.com/avatar.png"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="editing = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="usersStore.profileData.loading"
            class="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {{ usersStore.profileData.loading ? "Saving..." : "Save Changes" }}
          </button>
        </div>

        <!-- Error Message -->
        <p
          v-if="usersStore.profileData.error"
          class="text-red-500 text-sm mt-2"
        >
          {{ usersStore.profileData.error }}
        </p>
      </form>
    </div>

    <!-- Fallback if no user -->
    <div v-else-if="!usersStore.profileData.loading" class="text-center py-10">
      <p>Could not load profile. You might need to log in.</p>
      <button
        @click="authStore.isLoginModalOpen = true"
        class="mt-2 text-blue-600 hover:underline"
      >
        Login
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useUsersStore } from "@/store/users.store";
import { useAuthStore } from "@/store/auth.store";

/** Store references */
const usersStore = useUsersStore();
const authStore = useAuthStore();

/** Whether the user is in editing mode */
const editing = ref(false);

/** Computed profile from the store */
const profile = computed(() => usersStore.profileData.data);

/** Form data bound to inputs */
const form = reactive({
  name: "",
  email: "",
  bio: "",
  location: "",
  avatarUrl: "",
});

/** Populate form with current profile values */
const populateForm = () => {
  if (profile.value) {
    form.name = profile.value.name || "";
    form.email = profile.value.email || "";
    form.bio = profile.value.bio || "";
    form.location = profile.value.location || "";
    form.avatarUrl = profile.value.avatarUrl || "";
  } else {
    // Clear form if profile is null
    form.name = "";
    form.email = "";
    form.bio = "";
    form.location = "";
    form.avatarUrl = "";
  }
};

/** Lifecycle: onMounted, fetch profile if needed */
onMounted(async () => {
  if (authStore.isLoadingUser) {
    /** Wait for authStore to finish loading user */
    const unwatch = watch(
      () => authStore.isLoadingUser,
      (loading) => {
        if (!loading && authStore.user) {
          usersStore.fetchCurrentUserProfile();
          unwatch();
        } else if (!loading && !authStore.user) {
          unwatch();
        }
      }
    );
  } else if (authStore.user) {
    await usersStore.fetchCurrentUserProfile();
  }
});

/** Watcher: keep form in sync when profile changes and not editing */
watch(
  [profile, editing],
  ([newProfile, isEditing], [oldProfile, wasEditing]) => {
    if (newProfile && !isEditing) {
      populateForm();
    } else if (!newProfile && !isEditing) {
      populateForm(); // Clear form if profile is null
    }
    // When editing, don't auto-populate
  },
  { immediate: true, deep: true }
);

/** Toggle form mode */
const toggleEditMode = () => {
  editing.value = !editing.value;
  if (editing.value) populateForm(); // Load current data into form
};

/** Submit updated profile data */
async function handleUpdateProfile() {
  const updateData = {
    name: form.name,
    bio: form.bio,
    location: form.location,
    avatarUrl: form.avatarUrl,
  };

  if (updateData.avatarUrl === "") delete updateData.avatarUrl;

  try {
    await usersStore.updateUserProfile(updateData);
    editing.value = false;
  } catch (e) {
    console.error("Profile update failed:", e);
  }
}
</script>
