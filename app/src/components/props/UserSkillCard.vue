<template>
  <div
    class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div class="flex items-center mb-3">
      <img
        :src="user.avatarUrl || 'https://i.pravatar.cc/150?u=' + user.id"
        alt="User avatar"
        class="w-12 h-12 rounded-full mr-4 object-cover border"
      />
      <div>
        <h3 class="text-lg font-semibold text-gray-800">{{ user.name }}</h3>
        <p class="text-sm text-gray-500">{{ user.handle || "Loading..." }}</p>
      </div>
    </div>
    <div class="mb-3">
      <p class="text-sm text-gray-700 leading-relaxed">
        {{ user.description }}
      </p>
    </div>
    <div
      v-if="user.skills && user.skills.length"
      class="flex flex-wrap gap-2 mb-3"
    >
      <span
        v-for="skill in user.skills"
        :key="skill"
        class="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full"
      >
        {{ skill }}
      </span>
    </div>
    <a
      href="#"
      @click.prevent="viewMore"
      class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
    >
      Learn more
    </a>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({
      id: "default",
      name: "User Name",
      handle: "@username",
      avatarUrl: "",
      description:
        "Some description about what the user can teach or their skills.",
      skills: ["Skill 1", "Skill 2"],
    }),
  },
});

const emit = defineEmits(["view-more"]);

const viewMore = () => {
  emit("view-more", props.user.id);
};
</script>

<style scoped>
/* Add any component-specific styles here if needed, though Tailwind covers most cases */
</style>
