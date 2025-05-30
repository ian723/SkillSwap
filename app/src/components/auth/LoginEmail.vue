<template>
  <div
    class="bg-white p-4 rounded-md border border-gray-400 shadow-2xl max-w-7xl"
  >
    <p class="text-xl text-center p-4">Log in to access your account</p>
    <form @submit.prevent="onSubmit">
      <!-- Email -->
      <p class="p-2 text-lg">E-mail</p>
      <input
        type="text"
        v-model="formData.email"
        :class="{ 'border-2 border-red-500': v$.email.$error }"
        id="LoginEmail"
        class="w-full md:w-[350px] border border-gray-400 p-2 rounded-md"
        placeholder="Enter your email"
      />
      <p
        v-for="error in v$.email.$errors"
        :key="error.$uid"
        class="text-red-500"
      >
        {{ error.$message }}
      </p>

      <!-- Password -->
      <p class="p-2 text-lg">Password</p>
      <input
        type="password"
        v-model="formData.password"
        :class="{ 'border-2 border-red-500': v$.password.$error }"
        id="LoginPassword"
        class="w-full md:w-[350px] border border-gray-400 p-2 rounded-md"
        placeholder="Enter your password"
      />
      <p
        v-for="error in v$.password.$errors"
        :key="error.$uid"
        class="text-red-500"
      >
        {{ error.$message }}
      </p>

      <!-- Submit -->
      <div class="flex justify-center items-end py-8">
        <button
          class="text-white bg-blue-600 px-4 py-2 rounded-md w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          :disabled="v$.$invalid || isLoading"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </div>

      <!-- Links -->
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

      <!-- Error -->
      <div v-if="error" class="text-red-500 text-center">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email, minLength } from "@vuelidate/validators";
import { useAuthStore } from "@/store";

/** Store setup */
const authStore = useAuthStore();
const error = computed(() => authStore.error);
const isLoading = ref(false);

/** Clear previous errors */
onMounted(() => {
  authStore.error = null;
});

/** Form State */
const formData = reactive({
  email: "",
  password: "",
});

/** Vuelidate Rules */
const rules = {
  email: { required, email },
  password: { required, minLength: minLength(3) },
};
const v$ = useVuelidate(rules, formData);

/** Submit Handler */
const onSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  isLoading.value = true;
  try {
    await authStore.login(formData);
  } finally {
    isLoading.value = false;
  }
};

/** Switch to Signup Modal */
const switchToSignup = () => {
  authStore.isLoginModalOpen = false;
  authStore.isSignupModalOpen = true;
};
</script>
