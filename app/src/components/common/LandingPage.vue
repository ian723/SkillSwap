<template>
  <section
    class="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6"
  >
    <div class="max-w-3xl space-y-6">
      <h1
        class="text-5xl md:text-6xl font-extrabold text-indigo-800 leading-tight"
      >
        Swap Skills, <span class="text-indigo-500">Grow Together</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-700">
        SkillSwap connects learners and experts. Share what you know. Learn what
        you don't. No money needed just mutual growth.
      </p>
      <div class="flex justify-center space-x-4">
        <button
          @click="goToSignup"
          class="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-lg font-medium hover:bg-indigo-700 transition-all"
        >
          Join Now
        </button>
        <button
          @click="goToBrowse"
          class="bg-white border border-indigo-600 text-indigo-700 px-6 py-3 rounded-2xl text-lg font-medium hover:bg-indigo-100 transition-all"
        >
          Browse Skills
        </button>
      </div>
    </div>

    <!-- Features Teaser -->
    <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
      <FeatureCard
        icon="💡"
        title="Teach What You Know"
        text="Offer your skills to help others grow."
      />
      <FeatureCard
        icon="🎯"
        title="Learn What You Need"
        text="Find mentors and learn on your own terms."
      />
      <FeatureCard
        icon="🤝"
        title="No Fees, Just Value"
        text="No payments, only knowledge and passion."
      />
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import FeatureCard from "@/components/props/FeatureCard.vue";

const router = useRouter();

const goToSignup = () => {
  router.push("/browse");
};

const goToBrowse = () => {
  router.push("/browse");
};
</script>
