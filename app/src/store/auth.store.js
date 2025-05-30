import { ref } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { post, get } from "../providers/api/main";
import router from "../router";
import axiosInstance from "../providers/api/axios";

const baseUrl = `${import.meta.env.VITE_API_URL}`;
const mode = `${import.meta.env.VITE_MODE}`;

export const useAuthStore = defineStore("auth", () => {
  const user = ref(useLocalStorage("user", null));
  const access_token = ref(useLocalStorage("access_token", null));
  const returnUrl = ref(null);
  const error = ref(null);
  const isLoginModalOpen = ref(false);
  const isSignupModalOpen = ref(false);
  let login;

  /** Login method for local NestJS instance */
  async function login_local(formData) {
    const { email, password } = formData;
    console.log("Logging in with", { email, password });

    try {
      const res = await axiosInstance.post(`${baseUrl}/auth/signin`, {
        email,
        password,
      });

      access_token.value = res.data.access_token || null;
      localStorage.setItem("access_token", access_token.value);

      const me = await axiosInstance.get(`${baseUrl}/users/me`);
      user.value = me.data;

      isLoginModalOpen.value = false;
      router.push(returnUrl.value || "/");
    } catch (err) {
      console.error(err);
      error.value = err.response ? err.response.data.message : err.message;
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
    const { email, password } = formData;
    try {
      const res = await axiosInstance.post(`${baseUrl}/auth/signup`, {
        email,
        password,
      });

      access_token.value = res.access_token || null;
      localStorage.setItem("access_token", res.access_token);

      const me = await axiosInstance.get(`${baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${access_token.value}`,
        },
      });

      user.value = me;
      isSignupModalOpen.value = false;
      isLoginModalOpen.value = false;
      router.push("/");
    } catch (err) {
      console.error(err);
      error.value = err.response ? err.response.data.message : err.message;
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
    localStorage.removeItem("access_token");
    isLoginModalOpen.value = true;
    router.push("/");
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
    returnUrl,
    error,
    isLoginModalOpen,
    isSignupModalOpen,
    login,
    register,
    test,
    logout,
  };
});
