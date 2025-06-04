<!-- src/components/RecentSwaps.vue -->
<template>
  <section class="py-8 md:py-12 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2
        class="text-3xl font-bold tracking-tight text-gray-900 mb-8 text-center md:text-left"
      >
        Recent swans
      </h2>
      <div v-if="loading" class="text-center text-gray-500">
        Loading recent swaps...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Could not load recent swaps. Please try again later.
      </div>
      <div
        v-else-if="recentUsers && recentUsers.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <UserSkillCard
          v-for="user in recentUsers"
          :key="user.id"
          :user="user"
          @view-more="handleViewMore"
        />
      </div>
      <div v-else class="text-center text-gray-500">
        No recent swaps to display.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import UserSkillCard from "@/components/props/UserSkillCard.vue";

const recentUsers = ref([]);
const loading = ref(true);
const error = ref(null);

// Dummy data - replace with actual API call
const fetchRecentUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    recentUsers.value = [
      {
        id: "1",
        name: "Alex Turman",
        handle: "@hprmaririning",
        avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg", // Replace with actual or placeholder
        description:
          "Taught laughnlssam. Sharing insights on functional programming.",
        skills: ["Gunge", "Python", "Design"],
      },
      {
        id: "2",
        name: "Bnil Aice",
        handle: "@Poinsoong",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        description:
          "Brgor & riping. Expert in data analysis and visualization techniques.",
        skills: ["Python", "Bvgor & riping"],
      },
      {
        id: "3",
        name: "Jon Smith",
        handle: "@Deuthryimang",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        description:
          "Learn more about cloud architecture and DevOps practices.",
        skills: ["Python", "Jova", "JovaScript"], // Assuming Jova is a skill
      },
      {
        id: "4",
        name: "Aunsa Ollier",
        handle: "@Mankrtiring",
        avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg",
        description:
          "Jobe seen. Offering mentorship in project management and agile.",
        skills: ["Python", "Jova", "Mik"],
      },
    ];
  } catch (e) {
    console.error("Failed to fetch recent users:", e);
    error.value = e;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecentUsers();
});

const handleViewMore = (userId) => {
  console.log("View more details for user ID:", userId);
  // Here you would typically navigate to a user profile page
  // router.push(`/profile/${userId}`);
};
</script>

<style scoped>
/* Scoped styles if any specific overrides are needed */
</style>
