import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { post, get } from "../providers/api/main";
import router from "../router";
import axiosInstance from "../providers/api/axios";

const baseUrl = `${import.meta.env.VITE_API_URL}`;
const mode = `${import.meta.env.VITE_MODE}`;

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const access_token = ref(useLocalStorage("access_token", null));
  const returnUrl = ref(null);
  const error = ref(null);
  const isLoginModalOpen = ref(false);
  const isSignupModalOpen = ref(false);
  const isLoadingUser = ref(false);
  let login;

  function updateUserInAuthStore(updatedUserData) {
    if (user.value && updatedUserData) {
      user.value = { ...user.value, ...updatedUserData };
      console.log(
        "AuthStore: User data updated via updateUserInAuthStore:",
        user.value
      );
    } else if (updatedUserData && !user.value) {
      user.value = { ...updatedUserData };
      console.log(
        "AuthStore: User data set via updateUserInAuthStore (was null):",
        user.value
      );
    } else {
      console.warn(
        "AuthStore: updateUserInAuthStore called with invalid data or user not present."
      );
    }
  }

  /** Login method for local NestJS instance */
  async function login_local(formData) {
    const loginInput = formData.loginInput;
    const isEmail = /\S+@\S+\.\S+/.test(loginInput);
    const payload = isEmail
      ? { email: loginInput, password: formData.password }
      : { name: loginInput, password: formData.password };

    error.value = null;
    isLoadingUser.value = true;
    try {
      const res = await axiosInstance.post(`${baseUrl}/auth/signin`, payload);
      access_token.value = res.data.access_token || null;

      const me = await axiosInstance.get(`${baseUrl}/users/me`);
      user.value = me.data;

      isLoginModalOpen.value = false;
      router.push(returnUrl.value || "/");
    } catch (err) {
      console.error("Login failed:", err.response || err);
      error.value =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      if (access_token.value && !user.value) {
        access_token.value = null;
      }
    } finally {
      isLoadingUser.value = false;
    }
  }
  /** Login method for remote instance (if any) */
  async function login_remote(credentials) {
    try {
      const res = await post("auth/signin", credentials);

      access_token.value = res.data?.access_token || null;
      localStorage.setItem("access_token", res.data?.access_token);

      // Optional: fetch current user
      const me = await get("users/me", {
        headers: {
          Authorization: `Bearer ${access_token.value}`,
        },
      });

      user.value = me?.data || null;
      isLoginModalOpen.value = false;
      router.push(returnUrl.value || "/");
    } catch (err) {
      console.error(err);
      error.value = err.response ? err.response.data.message : err.message;
    }
  }

  /** Signup/Register method for NestJS */
  async function register(formData) {
    const { email, password, name } = formData;
    error.value = null;
    isLoadingUser.value = true;
    try {
      const res = await axiosInstance.post(`${baseUrl}/auth/signup`, {
        email,
        password,
        name,
      });
      access_token.value = res.data.access_token || null;
      const me = await axiosInstance.get(`${baseUrl}/users/me`);
      user.value = me.data;
      isSignupModalOpen.value = false;
      isLoginModalOpen.value = false;
      router.push("/");
    } catch (err) {
      console.error("Registration failed:", err.response || err);
      error.value = err.response?.data?.message || "Registration failed.";
      if (access_token.value && !user.value) {
        access_token.value = null;
      }
    } finally {
      isLoadingUser.value = false;
    }
  }

  /** Test protected API route */
  async function test() {
    try {
      const res = await get("shops", {
        headers: {
          Authorization: `Bearer ${access_token.value}`,
        },
      });
      console.log(res);
    } catch (err) {
      console.error(err);
      // Logout if token invalid
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    }
  }

  /** Logout method */
  function logout() {
    user.value = null;
    access_token.value = null;
    isLoginModalOpen.value = true;
    router.push("/");
  }

  /** Fetch current logged-in user profile from /users/me */
  async function fetchUserOnAppLoad() {
    if (access_token.value && !user.value) {
      isLoadingUser.value = true;
      error.value = null;
      console.log(
        "AuthStore: Token found, attempting to fetch user (/users/me)..."
      );
      try {
        const me = await axiosInstance.get(`${baseUrl}/users/me`);
        user.value = me.data;
        console.log(
          "AuthStore: User fetched successfully on app load:",
          user.value
        );
      } catch (err) {
        console.error(
          "AuthStore: Failed to fetch user on app load:",
          err.response || err
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("AuthStore: Token invalid/expired, logging out.");
          logout();
        } else {
          error.value =
            "Could not load your session. Please try logging in again.";
        }
      } finally {
        isLoadingUser.value = false;
      }
    } else if (user.value) {
      console.log("AuthStore: User already loaded.");
    } else {
      console.log("AuthStore: No access token found, user not fetched.");
    }
  }

  /** Identify mode */
  if (mode === "local") {
    login = login_local;
  } else if (mode === "remote") {
    login = login_remote;
  }

  return {
    user,
    access_token,
    isAuthenticated: computed(() => !!user.value),
    isLoadingUser,
    returnUrl,
    error,
    isLoginModalOpen,
    isSignupModalOpen,
    login,
    register,
    logout,
    fetchUserOnAppLoad,
    updateUserInAuthStore,
  };
});
