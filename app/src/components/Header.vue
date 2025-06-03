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
        <!-- Show loading indicator while fetching user on app load -->
        <template v-if="authStore.isLoadingUser">
          <span class="text-gray-500">Loading...</span>
        </template>
        <template v-else-if="authStore.isAuthenticated">
          <!-- User avatar and name with dropdown toggle -->
          <div
            class="relative flex items-center space-x-3 cursor-pointer"
            @click="toggleDropdown"
            ref="dropdownAvatarRef"
          >
            <img
              :src="authStore.user?.avatarUrl || 'https://i.pravatar.cc/40'"
              class="rounded-full h-9 w-9 border object-cover"
              alt="avatar"
            />
            <span class="hidden md:inline font-semibold text-gray-800">
              {{ authStore.user?.name || "User" }}
            </span>
          </div>

          <!-- Dropdown menu -->
          <div
            v-if="showDropdown"
            class="absolute top-full mt-2 w-40 bg-white border rounded-md shadow-lg z-50"
            ref="dropdownMenuRef"
          >
            <RouterLink
              to="/profile"
              class="block px-4 py-2 hover:bg-gray-100"
              @click="closeDropdown"
            >
              Profile
            </RouterLink>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </template>
        <template v-else>
          <!-- Login button when not authenticated -->
          <button
            @click="openLoginModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log in
          </button>
        </template>

        <!-- Mobile menu toggle -->
        <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="text-gray-800 font-bold text-lg">
            {{ mobileMenuOpen ? "✕" : "☰" }}
          </span>
        </button>
      </div>
    </nav>

    <!-- Mobile Nav menu -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden px-4 pt-4 pb-6 space-y-3 bg-white border-t"
    >
      <RouterLink
        v-for="item in navLinks"
        :key="item.path"
        :to="item.path"
        @click="mobileMenuOpen = false"
        class="block py-2 px-3 rounded hover:bg-gray-100"
      >
        {{ item.label }}
      </RouterLink>

      <template v-if="authStore.isLoadingUser">
        <span class="block py-2 px-3 text-gray-500">Loading...</span>
      </template>
      <template v-else-if="authStore.isAuthenticated">
        <RouterLink
          to="/profile"
          class="block py-2 px-3 rounded hover:bg-gray-100"
          @click="mobileMenuOpen = false"
        >
          Profile
        </RouterLink>
        <button
          @click="handleLogoutMobile"
          class="w-full text-left py-2 px-3 rounded text-red-500 hover:bg-red-50"
        >
          Log out
        </button>
      </template>
      <template v-else>
        <button
          @click="openLoginModalMobile"
          class="block py-2 px-3 rounded text-blue-600 hover:bg-gray-100"
        >
          Log in
        </button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.store";

/** Store managing authentication state and actions */
const authStore = useAuthStore();

/** Current route object for active link highlighting */
const route = useRoute();
/** Router instance, in case you need to programmatically navigate */
const router = useRouter();

/** Controls whether the mobile menu is shown */
const mobileMenuOpen = ref(false);

/** Controls visibility of the profile dropdown menu */
const showDropdown = ref(false);

/** Ref to the avatar element to detect outside clicks */
const dropdownAvatarRef = ref(null);
/** Ref to the dropdown menu itself to detect outside clicks */
const dropdownMenuRef = ref(null);

/** Navigation links displayed in both desktop and mobile views */
const navLinks = [
  { path: "#", label: "Browse" },
  { path: "#", label: "Swap Requests" },
  { path: "#", label: "Messages" },
];

/**
 * Checks if a nav link is currently active based on route
 * @param {string} path - Route path to check
 * @returns {boolean}
 */
const isActive = (path) =>
  route.path === path || (path !== "/" && route.path.startsWith(path));

/** Opens the login modal (used in desktop view) */
const openLoginModal = () => {
  if (!authStore.isLoadingUser && !authStore.isAuthenticated) {
  }
  authStore.isLoginModalOpen = true;
};

/** Opens the login modal and closes the mobile menu */
const openLoginModalMobile = () => {
  openLoginModal();
  mobileMenuOpen.value = false;
};

/** Logs out user and closes dropdown menu */
const handleLogout = async () => {
  await authStore.logout();
  showDropdown.value = false;
};

/** Logs out user from mobile view and closes the mobile menu */
const handleLogoutMobile = async () => {
  await authStore.logout();
  mobileMenuOpen.value = false;
};

/** Toggles visibility of the user dropdown menu */
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

/** Closes the dropdown menu */
const closeDropdown = () => {
  showDropdown.value = false;
};

/**
 * Detects and closes dropdown when a click occurs outside of avatar/menu
 * @param {MouseEvent} event
 */
const handleClickOutside = (event) => {
  if (
    showDropdown.value &&
    dropdownAvatarRef.value &&
    !dropdownAvatarRef.value.contains(event.target) &&
    dropdownMenuRef.value &&
    !dropdownMenuRef.value.contains(event.target)
  ) {
    showDropdown.value = false;
  }
};

/** Adds event listener for outside click detection */
onMounted(() => {
  document.addEventListener("click", handleClickOutside, true); // capture phase
});

/** Cleans up event listener on unmount */
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
});
</script>

<style scoped>
.dropdown-menu {
  top: 100%;
  right: 0;
}
.object-cover {
  object-fit: cover;
}
</style>
