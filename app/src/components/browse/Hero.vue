<template>
  <div>
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
            class="text-3xl font-bold tracking-tight text-gray-900 text-center md:text-left"
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
          <UserSkillCard
            v-for="userProfileItem in displayedUsers"
            :key="userProfileItem.id"
            :profile="userProfileItem"
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
import UserSkillCard from "@/components/props/UserSkillCard.vue";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import axiosInstance from "@/providers/api/axios";

const USERS_API_BASE_URL = "/users";

const router = useRouter();

const searchForm = reactive({
  canTeach: "",
  wantsToLearn: "",
});

const recentUsers = ref([]);
const searchResults = ref([]);
const loadingUsers = ref(true);
const usersError = ref(null);
const isSearching = ref(false);
const searchError = ref(null);
const hasSearched = ref(false);

// Determines which list of users to display
const displayedUsers = computed(() => {
  return hasSearched.value ? searchResults.value : recentUsers.value;
});

const displaySectionTitle = computed(() => {
  return hasSearched.value ? "Search Results" : "Recent Activity";
});

// Fetches initially displayed "recent" users
const fetchRecentUsers = async () => {
  loadingUsers.value = true;
  usersError.value = null;
  try {
    const response = await axiosInstance.get(
      `${USERS_API_BASE_URL}/recent-active?limit=4`
    );
    recentUsers.value = response.data;
  } catch (err) {
    console.error("Failed to fetch recent users:", err);
    usersError.value =
      err.response?.data?.message || "Could not load recent users.";
  } finally {
    if (!isSearching.value) {
      loadingUsers.value = false;
    }
  }
};

// Executes a search based on form input
const executeSearch = async () => {
  if (!searchForm.canTeach && !searchForm.wantsToLearn) {
    searchError.value = "Please enter at least one skill to search.";
    clearSearchAndShowRecent();
    return;
  }

  isSearching.value = true;
  loadingUsers.value = true;
  usersError.value = null;
  searchError.value = null;
  hasSearched.value = true;
  searchResults.value = [];

  try {
    const params = {};
    if (searchForm.canTeach) params.wantsToLearn = searchForm.canTeach;
    if (searchForm.wantsToLearn) params.canTeach = searchForm.wantsToLearn;

    const response = await axiosInstance.get(`${USERS_API_BASE_URL}/search`, {
      params,
    });
    searchResults.value = response.data;
    [];
  } catch (err) {
    console.error("Search failed:", err);
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
  if (recentUsers.value.length === 0 && !loadingUsers.value) {
    fetchRecentUsers();
  }
};

const handleViewUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

onMounted(() => {
  fetchRecentUsers();
});
</script>
