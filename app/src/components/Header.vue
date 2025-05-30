<!-- Header.vue -->
<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
      <!-- Logo -->
      <RouterLink to="/" class="text-2xl font-bold text-gray-800">
        SkillSwap
      </RouterLink>

      <!-- Desktop Nav -->
      <ul class="hidden md:flex space-x-6 text-gray-600 font-medium">
        <li v-for="item in navLinks" :key="item.path">
          <RouterLink
            :to="item.path"
            class="hover:text-black transition"
            :class="{ 'text-black font-semibold': isActive(item.path) }"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>

      <!-- Auth & Hamburger -->
      <div class="flex items-center gap-4">
        <template v-if="isAuthenticated">
          <!-- Avatar -->
          <div class="relative">
            <img
              src="https://i.pravatar.cc/40"
              class="rounded-full h-9 w-9 cursor-pointer border"
              @click="toggleDropdown"
              alt="avatar"
            />
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50"
            >
              <RouterLink
                to="/profile"
                class="block px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </RouterLink>
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <button
            @click="openLoginModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log in
          </button>
        </template>

        <!-- Mobile toggle -->
        <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="text-gray-800 font-bold text-lg">
            {{ mobileMenuOpen ? "✕" : "☰" }}
          </span>
        </button>
      </div>
    </nav>

    <!-- Mobile Nav -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden px-4 pt-4 pb-6 space-y-3 bg-white border-t"
    >
      <RouterLink
        v-for="item in navLinks"
        :key="item.path"
        :to="item.path"
        @click="mobileMenuOpen = false"
        class="block"
      >
        {{ item.label }}
      </RouterLink>
      <div v-if="isAuthenticated">
        <RouterLink to="/profile" class="block" @click="mobileMenuOpen = false"
          >Profile</RouterLink
        >
        <button @click="logout" class="text-red-500">Log out</button>
      </div>
      <div v-else>
        <button
          @click="
            () => {
              openLoginModal();
              mobileMenuOpen = false;
            }
          "
          class="block text-blue-600"
        >
          Log in
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const mobileMenuOpen = ref(false);
const showDropdown = ref(false);

const navLinks = [
  { path: "#", label: "Browse" },
  { path: "#", label: "Swap Requests" },
  { path: "#", label: "Messages" },
];

const isAuthenticated = computed(() => !!authStore.user);
const isActive = (path) => route.path.startsWith(path);

const openLoginModal = () => {
  authStore.isLoginModalOpen = true;
};

const logout = () => {
  authStore.logout();
  router.push("/");
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};
</script>
