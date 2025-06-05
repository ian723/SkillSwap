<template>
  <div
    class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
  >
    <div class="flex items-center mb-3">
      <img
        :src="profile.avatarUrl || 'https://i.pravatar.cc/150?u=' + profile.id"
        alt="User avatar"
        class="w-12 h-12 rounded-full mr-4 object-cover border"
      />
      <div>
        <h3 class="text-lg font-semibold text-gray-800">{{ profile.name }}</h3>
        <p class="text-sm text-gray-500">
          {{ profile.location || "Location not set" }}
        </p>
      </div>
    </div>
    <div class="mb-3 flex-grow">
      <p
        class="text-sm text-gray-700 leading-relaxed line-clamp-3"
        :title="profile.bio"
      >
        {{ profile.bio || "No bio available." }}
      </p>
    </div>
    <div v-if="profile.skills && profile.skills.length" class="mb-4">
      <div v-if="teachingSkills.length > 0" class="mb-2">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
          Can Teach:
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="userSkill in teachingSkills.slice(0, 3)"
            :key="userSkill.skill.id"
            class="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {{ userSkill.skill.name }}
          </span>
          <span
            v-if="teachingSkills.length > 3"
            class="text-xs text-gray-500 self-end"
            >...</span
          >
        </div>
      </div>
      <div v-if="learningSkills.length > 0">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
          Wants to Learn:
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="userSkill in learningSkills.slice(0, 3)"
            :key="userSkill.skill.id"
            class="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {{ userSkill.skill.name }}
          </span>
          <span
            v-if="learningSkills.length > 3"
            class="text-xs text-gray-500 self-end"
            >...</span
          >
        </div>
      </div>
    </div>
    <a
      href="#"
      @click.prevent="viewProfile"
      class="block mt-auto pt-2 border-t border-gray-100 text-sm font-medium text-center text-blue-600 hover:text-blue-800 transition-colors"
    >
      View Profile
    </a>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  profile: {
    // Expects an object similar to UserProfileDto from backend
    type: Object,
    required: true,
    default: () => ({
      // Default structure matching UserProfileDto
      id: "defaultUser",
      name: "Default User",
      avatarUrl: null,
      bio: "This is a default bio.",
      location: "Default Location",
      skills: [
        // Array of UserSkillDto like objects
        // { id: 'us1', type: 'teach', skill: { id: 's1', name: 'Teaching Skill 1' } },
        // { id: 'us2', type: 'learn', skill: { id: 's2', name: 'Learning Skill 1' } },
      ],
    }),
  },
});

const emit = defineEmits(["view-profile"]);

const teachingSkills = computed(
  () => props.profile.skills?.filter((s) => s.type === "teach") || []
);
const learningSkills = computed(
  () => props.profile.skills?.filter((s) => s.type === "learn") || []
);

const viewProfile = () => {
  emit("view-profile", props.profile.id);
};
</script>

<style scoped>
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  /* Fallback for non-webkit browsers if you want to set a max-height */
  /* max-height: calc(1.5em * 3); /* Adjust 1.5em based on your line-height */
}
</style>
