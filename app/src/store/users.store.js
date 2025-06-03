// src/store/users.store.js
import { ref } from "vue";
import { defineStore } from "pinia";
import axiosInstance from "../providers/api/axios"; // Use your configured axios
import { useAuthStore } from "./auth.store"; // To update authStore if needed

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useUsersStore = defineStore("users", () => {
  const authStore = useAuthStore(); // Get a reference to the auth store

  // State for a list of all users (optional, for admin or browsing)
  const allUsers = ref({
    data: [],
    loading: false,
    error: null,
  });

  const profileData = ref({
    data: null,
    loading: false,
    error: null,
  });

  /** Fetch all users (example) */
  async function fetchAllUsers() {
    allUsers.value.loading = true;
    allUsers.value.error = null;
    try {
      const response = await axiosInstance.get(baseUrl);
      allUsers.value.data = response.data;
    } catch (error) {
      console.error(
        "UsersStore: Error fetching all users:",
        error.response || error
      );
      allUsers.value.error =
        error.response?.data?.message || "Failed to load users.";
    } finally {
      allUsers.value.loading = false;
    }
  }

  /**
   * Fetch the detailed profile for the currently authenticated user.
   * Assumes /users/me returns all necessary editable profile fields.
   * If you have a separate endpoint like /users/:id/profile, adjust accordingly.
   */
  async function fetchCurrentUserProfile() {
    if (!authStore.user || !authStore.user.id) {
      profileData.value.error = "User not authenticated. Cannot fetch profile.";
      console.warn(
        "UsersStore: fetchCurrentUserProfile called without authenticated user."
      );
      return;
    }

    profileData.value.loading = true;
    profileData.value.error = null;
    try {
      if (authStore.user) {
        profileData.value.data = { ...authStore.user };
        console.log(
          "UsersStore: Profile data set from authStore.user",
          profileData.value.data
        );
      } else {
        const response = await axiosInstance.get(`${baseUrl}/me`);
        profileData.value.data = response.data;
        if (!authStore.user) authStore.updateUserInAuthStore(response.data);
      }
    } catch (error) {
      console.error(
        "UsersStore: Error fetching current user profile:",
        error.response || error
      );
      profileData.value.error =
        error.response?.data?.message || "Failed to load profile.";
    } finally {
      profileData.value.loading = false;
    }
  }

  /**
   * Update the current user's profile.
   * @param {object} updateData - e.g., { name, bio, location, avatarUrl }
   */
  async function updateUserProfile(updateData) {
    if (!authStore.user || !authStore.user.id) {
      profileData.value.error =
        "User not authenticated. Cannot update profile.";
      return Promise.reject(new Error("User not authenticated."));
    }

    profileData.value.loading = true;
    profileData.value.error = null;
    try {
      const response = await axiosInstance.patch(`${baseUrl}/me`, updateData);

      profileData.value.data = response.data;

      authStore.updateUserInAuthStore(response.data);

      console.log(
        "UsersStore: Profile updated successfully",
        profileData.value.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "UsersStore: Error updating profile:",
        error.response || error
      );
      profileData.value.error =
        error.response?.data?.message || "Failed to update profile.";
      return Promise.reject(error.response?.data || error);
    } finally {
      profileData.value.loading = false;
    }
  }

  return {
    allUsers,
    profileData,
    fetchAllUsers,
    fetchCurrentUserProfile,
    updateUserProfile,
  };
});
