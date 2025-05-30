<template>
  <div
    class="bg-white p-6 rounded-md border border-gray-400 shadow-2xl max-w-md mx-auto"
  >
    <p class="text-xl text-center mb-6">Create your account</p>
    <form @submit.prevent="onSubmit" novalidate>
      <!-- Email -->
      <label class="block mb-1">Email</label>
      <input
        type="email"
        v-model="formData.email"
        :class="inputClass(v$.email)"
        class="w-full p-2 mb-3 rounded border"
        autocomplete="email"
      />
      <p v-if="v$.email.$error" class="text-red-500 text-sm mb-2">
        <span v-for="err in v$.email.$errors" :key="err.$uid">
          {{ err.$message }}
        </span>
      </p>

      <!-- Password -->
      <label class="block mb-1">Password</label>
      <input
        type="password"
        v-model="formData.password"
        :class="inputClass(v$.password)"
        class="w-full p-2 mb-3 rounded border"
        autocomplete="new-password"
      />
      <p v-if="v$.password.$error" class="text-red-500 text-sm mb-2">
        <span v-for="err in v$.password.$errors" :key="err.$uid">
          {{ err.$message }}
        </span>
      </p>

      <!-- Confirm Password -->
      <label class="block mb-1">Confirm Password</label>
      <input
        type="password"
        v-model="formData.confirmPassword"
        :class="inputClass(v$.confirmPassword)"
        class="w-full p-2 mb-4 rounded border"
        autocomplete="new-password"
      />
      <p v-if="v$.confirmPassword.$error" class="text-red-500 text-sm mb-2">
        <span v-for="err in v$.confirmPassword.$errors" :key="err.$uid">
          {{ err.$message }}
        </span>
      </p>

      <!-- Submit -->
      <button
        :disabled="v$.$invalid || isLoading"
        class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
      >
        <span v-if="isLoading">Creating account...</span>
        <span v-else>Sign Up</span>
      </button>

      <!-- Error message -->
      <p v-if="auth.error" class="text-red-600 mt-3 text-center">
        {{ auth.error }}
      </p>
    </form>

    <!-- Switch to Login -->
    <div class="mt-4 text-center text-sm">
      <span>Already have an account?</span>
      <button
        @click="switchToLogin"
        class="text-blue-600 hover:underline ml-1"
        type="button"
      >
        Log in
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import { useAuthStore } from "@/store";

/** Store */
const auth = useAuthStore();
const isLoading = ref(false);

/** Reactive form data */
const formData = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

/** Validation rules */
const rules = computed(() => ({
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAsPassword: sameAs(formData.password) },
}));

const v$ = useVuelidate(rules, formData);

/** Form validation styling */
const inputClass = (field) =>
  field.$error ? "border-2 border-red-500" : "border border-gray-300";

/** Submit function */
const onSubmit = async () => {
  const valid = await v$.value.$validate();
  if (!valid) return;

  isLoading.value = true;
  try {
    await auth.register({
      email: formData.email,
      password: formData.password,
    });
  } finally {
    isLoading.value = false;
  }
};

/** Switch to login modal */
const switchToLogin = () => {
  auth.isSignupModalOpen = false;
  auth.isLoginModalOpen = true;
};
</script>
