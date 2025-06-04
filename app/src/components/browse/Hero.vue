<!-- src/views/HomeView.vue -->
<template>
  <div>
    <!-- Hero Section: "Learn new skills..." & Search -->
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
                @submit.prevent="handleSearch"
                class="grid grid-cols-1 gap-y-6"
              >
                <div>
                  <label
                    for="teach-skills"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >I can teach</label
                  >
                  <input
                    type="text"
                    name="teach-skills"
                    id="teach-skills"
                    v-model="searchForm.canTeach"
                    class="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md placeholder-gray-400"
                    placeholder="e.g., Python, Guitar, Cooking"
                  />
                </div>
                <div>
                  <label
                    for="learn-skills"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >I want to learn</label
                  >
                  <input
                    type="text"
                    name="learn-skills"
                    id="learn-skills"
                    v-model="searchForm.wantsToLearn"
                    class="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md placeholder-gray-400"
                    placeholder="e.g., JavaScript, Photography"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Search Swaps
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const searchForm = reactive({
  canTeach: "",
  wantsToLearn: "",
});

const handleSearch = () => {
  console.log("Searching for:", {
    canTeach: searchForm.canTeach,
    wantsToLearn: searchForm.wantsToLearn,
  });
  // Example: Navigate to a search results page
  // This requires a '/search' route to be defined in your router
  // const query = {};
  // if (searchForm.canTeach) query.teach = searchForm.canTeach;
  // if (searchForm.wantsToLearn) query.learn = searchForm.wantsToLearn;
  // if (Object.keys(query).length > 0) {
  //   router.push({ path: '/search', query });
  // }
};
</script>
