<template>
  <div class="min-h-screen bg-white">
    <Header />

    <div class="mt-4">
      <RouterView />

      <!-- LOGIN MODAL -->
      <div
        v-if="auth.isLoginModalOpen"
        @close="auth.isLoginModalOpen = false"
        class="modal-overlay"
        id="login-form"
        @click="closeLoginModal"
      >
        <div class="modal-content max-w-7xl" @click.stop>
          <LoginEmail />
        </div>
      </div>

      <!-- SIGNUP MODAL -->
      <div
        v-if="auth.isSignupModalOpen"
        class="modal-overlay"
        id="signup-form"
        @click="closeSignupModal"
      >
        <div class="modal-content max-w-7xl" @click.stop>
          <SignupEmail />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import LoginEmail from "@/components/auth/LoginEmail.vue";
import SignupEmail from "@/components/auth/SignupEmail.vue";
import { useAuthStore } from "./store";
import router from "./router";

/**VARIABLES */
const auth = useAuthStore();

/**FUNCTIONS*/
const closeLoginModal = () => {
  auth.isLoginModalOpen = false;
};

const closeSignupModal = () => {
  auth.isSignupModalOpen = false;
};

router.isReady().then(async () => {
  await auth.fetchUserOnAppLoad();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 26;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
