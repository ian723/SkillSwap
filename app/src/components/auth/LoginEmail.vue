<template>
  <!-- Outer card container for the login form -->
  <div
    class="bg-white p-4 rounded-md border border-gray-400 shadow-2xl max-w-7xl"
  >
    <!-- Title -->
    <p class="text-xl text-center p-4">Log in to access your account</p>

    <!-- Form logic tied to onSubmit() -->
    <form @submit.prevent="onSubmit">
      <!-- Email/Username input label -->
      <p class="p-2 text-lg">E-mail or Username</p>

      <!-- Login input field with dynamic error class from Vuelidate -->
      <input
        type="text"
        v-model="formData.loginInput"
        :class="{ 'border-2 border-red-500': v$.loginInput.$error }"
        id="LoginEmail"
        class="w-full md:w-[350px] border border-gray-400 p-2 rounded-md"
        autocomplete="email"
        placeholder="Enter your username or email"
      />

      <!-- Looping over all validation error messages for loginInput -->
      <p
        v-for="error in v$.loginInput.$errors"
        :key="error.$uid"
        class="text-red-500"
      >
        {{ error.$message }}
      </p>

      <!-- Password input label -->
      <p class="p-2 text-lg">Password</p>

      <!-- Password field with error display like loginInput -->
      <input
        type="password"
        v-model="formData.password"
        :class="{ 'border-2 border-red-500': v$.password.$error }"
        id="LoginPassword"
        class="w-full md:w-[350px] border border-gray-400 p-2 rounded-md"
        autocomplete="current-password"
        placeholder="Enter your password"
      />

      <!-- Show validation messages for password -->
      <p
        v-for="error in v$.password.$errors"
        :key="error.$uid"
        class="text-red-500"
      >
        {{ error.$message }}
      </p>

      <!-- Submit button, shows loading state and disables when invalid -->
      <div class="flex justify-center items-end py-8">
        <button
          class="text-white bg-blue-600 px-4 py-2 rounded-md w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          :disabled="v$.$invalid || isLoading"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </div>

      <!-- Forgot password and switch-to-signup links -->
      <div class="flex justify-between text-sm px-2 mb-4">
        <a href="/forgot-password" class="text-blue-600 hover:underline">
          Forgot password?
        </a>
        <button
          type="button"
          @click="switchToSignup"
          class="text-blue-600 hover:underline"
        >
          Create account
        </button>
      </div>

      <!-- Display auth error message from the store -->
      <div v-if="error" class="text-red-500 text-center">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
/**
 * Core Vue 3 Composition API utilities
 */
import { computed, onMounted, reactive, ref } from "vue";

/**
 * Vuelidate validation setup
 * - `useVuelidate` is the core function
 * - `required` and `minLength` are validation rules
 */
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

/**
 * Pinia Auth Store
 * - Handles global auth state like login, errors, modal visibility
 */
import { useAuthStore } from "@/store";

/**
 * Initialize the auth store instance
 */
const authStore = useAuthStore();

/**
 * Reactive reference to auth error (auto-updated via Pinia)
 */
const error = computed(() => authStore.error);

/**
 * Controls loading spinner and disables the login button during submission
 */
const isLoading = ref(false);

/**
 * Clear any lingering auth errors when the component mounts
 */
onMounted(() => {
  authStore.error = null;
});

/**
 * Reactive form data object
 * - loginInput: accepts either email or username
 * - password: required + validated
 */
const formData = reactive({
  loginInput: "",
  password: "",
});

/**
 * Validation rules using Vuelidate
 * - loginInput is required
 * - password is required and must be at least 6 characters long
 */
const rules = computed(() => ({
  loginInput: { required },
  password: { required, minLength: minLength(6) },
}));

/**
 * Initialize Vuelidate instance
 * - Binds rules to formData
 */
const v$ = useVuelidate(rules, formData);

/**
 * Handles form submission
 * - Validates inputs
 * - Calls store's login function if valid
 * - Shows loading state while awaiting response
 */
const onSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  isLoading.value = true;

  try {
    await authStore.login({
      loginInput: formData.loginInput,
      password: formData.password,
    });
    authStore.isLoginModalOpen = false;
  } finally {
    isLoading.value = false;
  }
};

/**
 * Switches from login modal to signup modal
 * - Closes login modal
 * - Opens signup modal
 */
const switchToSignup = () => {
  authStore.isLoginModalOpen = false;
  authStore.isSignupModalOpen = true;
};
</script>
