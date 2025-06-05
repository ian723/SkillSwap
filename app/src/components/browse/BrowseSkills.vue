<!-- src/views/HomeView.vue -->
<template>
  <div>
    <!-- Hero Section: "Learn new skills..." & Search Form -->
    <section class="bg-white py-12 md:py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
          <div
            class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
          >
            <h1
              class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span class="block">Learn new skills,</span>
              <span class="block text-blue-600 xl:inline">share your own</span>
            </h1>
            <p
              class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
            >
              Connect with people to exchange skills and knowledge. Find experts
              or offer your expertise to others in a collaborative community.
            </p>
          </div>
          <div
            class="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6"
          >
            <div
              class="bg-gray-50 p-6 sm:p-8 shadow-xl rounded-lg w-full border border-gray-200"
            >
              <form
                @submit.prevent="executeSearch"
                class="grid grid-cols-1 gap-y-6"
              >
                <div>
                  <label
                    for="canTeachQuery"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >I can teach</label
                  >
                  <input
                    type="text"
                    id="canTeachQuery"
                    v-model="searchForm.canTeach"
                    class="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md placeholder-gray-400"
                    placeholder="e.g., Python, Guitar (you offer this)"
                  />
                </div>
                <div>
                  <label
                    for="wantsToLearnQuery"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >I want to learn</label
                  >
                  <input
                    type="text"
                    id="wantsToLearnQuery"
                    v-model="searchForm.wantsToLearn"
                    class="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md placeholder-gray-400"
                    placeholder="e.g., JavaScript, Photography (you seek this)"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    :disabled="isSearching"
                  >
                    <span
                      v-if="isSearching"
                      class="animate-spin mr-2 inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full align-[-0.125em]"
                    ></span>
                    {{ isSearching ? "Searching..." : "Search Users" }}
                  </button>
                </div>
              </form>
              <p v-if="searchError" class="mt-3 text-sm text-red-600">
                {{ searchError }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section for Displaying Users (Recent or Search Results) -->
    <section class="py-8 md:py-12 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2
            class="text-3xl font-bold tracking-tight text-gray-900 md:text-left"
          >
            {{ displaySectionTitle }}
          </h2>
          <button
            v-if="hasSearched"
            @click="clearSearchAndShowRecent"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Show Recent
          </button>
        </div>

        <div v-if="loadingUsers" class="text-center text-gray-500 py-10">
          <LoadingSpinner message="Loading users..." />
        </div>
        <div v-else-if="usersError" class="text-center text-red-500 py-10">
          <ErrorState
            :message="usersError"
            @action="hasSearched ? executeSearch() : fetchRecentUsers()"
            action-text="Try Again"
          />
        </div>
        <div
          v-else-if="displayedUsers && displayedUsers.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <!-- Correctly using :profile prop -->
          <UserSkillCard
            v-for="userProfileData in displayedUsers"
            :key="userProfileData.id"
            :profile="userProfileData"
            @view-profile="handleViewUserProfile"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-10">
          <EmptyState
            :message="
              hasSearched
                ? 'No users found matching your search.'
                : 'No recent users to display.'
            "
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import UserSkillCard from "@/components/props/UserSkillCard.vue"; // Path to your UserSkillCard
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue"; // Create these simple UI components
import ErrorState from "@/components/ui/ErrorState.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import axiosInstance from "@/providers/api/axios";

const USERS_API_BASE_URL = "/users"; // Base URL for user-related endpoints

const router = useRouter();

const searchForm = reactive({
  canTeach: "",
  wantsToLearn: "",
});

const recentUsers = ref([]); // Stores data from /users/recent-active
const searchResults = ref([]); // Stores data from /users/search
const loadingUsers = ref(true); // Unified loading state
const usersError = ref(null); // Unified error state
const isSearching = ref(false); // For search button loading state
const searchError = ref(null); // For errors specific to the search form submission
const hasSearched = ref(false); // To toggle between recent and search results display

const displayedUsers = computed(() => {
  return hasSearched.value ? searchResults.value : recentUsers.value;
});

const displaySectionTitle = computed(() => {
  return hasSearched.value ? "Search Results" : "Recent Activity";
});

const fetchRecentUsers = async () => {
  loadingUsers.value = true;
  usersError.value = null;
  try {
    const response = await axiosInstance.get(
      `${USERS_API_BASE_URL}/recent-active?limit=8`
    ); // Fetch 8 for a 4-col grid
    // Backend should return UserCardDataDto[] or UserProfileDto[]
    // This structure should match what UserSkillCard's :profile prop expects
    recentUsers.value = response.data;
  } catch (err) {
    console.error(
      "Failed to fetch recent users:",
      err.response?.data || err.message,
      err
    );
    usersError.value =
      err.response?.data?.message || "Could not load recent users.";
  } finally {
    // Only set global loading to false if a search isn't overriding it
    if (!isSearching.value) {
      loadingUsers.value = false;
    }
  }
};

const executeSearch = async () => {
  if (!searchForm.canTeach && !searchForm.wantsToLearn) {
    searchError.value = "Please enter at least one skill to search.";
    // Optionally revert to recent users if search is cleared
    // clearSearchAndShowRecent(); // Or just show the error and let user clear
    return;
  }

  isSearching.value = true; // For search button spinner
  loadingUsers.value = true; // For the results area spinner
  usersError.value = null; // Clear previous general errors
  searchError.value = null; // Clear previous search form errors
  hasSearched.value = true; // Indicate that a search has been performed
  searchResults.value = []; // Clear previous search results

  try {
    const params = {};
    // Backend logic: if I canTeach 'Python', I'm looking for users who wantToLearn 'Python'
    if (searchForm.canTeach) params.wantsToLearn = searchForm.canTeach;
    // Backend logic: if I wantToLearn 'Guitar', I'm looking for users who canTeach 'Guitar'
    if (searchForm.wantsToLearn) params.canTeach = searchForm.wantsToLearn;

    const response = await axiosInstance.get(`${USERS_API_BASE_URL}/search`, {
      params,
    });
    searchResults.value = response.data; // Expects UserCardDataDto[] or UserProfileDto[]
  } catch (err) {
    console.error("Search failed:", err.response?.data || err.message, err);
    usersError.value =
      err.response?.data?.message || "Search failed. Please try again.";
  } finally {
    isSearching.value = false;
    loadingUsers.value = false;
  }
};

const clearSearchAndShowRecent = () => {
  searchForm.canTeach = "";
  searchForm.wantsToLearn = "";
  hasSearched.value = false;
  searchResults.value = [];
  usersError.value = null;
  searchError.value = null;
  // If recentUsers is empty and not currently loading, fetch them
  // This ensures "Recent Activity" is populated if user clears search without any prior results
  if (recentUsers.value.length === 0 && !loadingUsers.value) {
    fetchRecentUsers();
  } else if (recentUsers.value.length > 0) {
    // If recent users are already loaded, ensure the loading state is false for the display section
    loadingUsers.value = false;
  }
};

const handleViewUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

onMounted(() => {
  fetchRecentUsers(); // Load recent users when the component mounts
});
</script>
