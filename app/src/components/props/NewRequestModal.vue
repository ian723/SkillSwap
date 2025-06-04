<template>
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Send Swap Request</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm">
        <!-- User Select -->
        <div class="mb-4">
          <label
            for="toUserId"
            class="block mb-1 text-sm font-medium text-gray-700"
            >To (User)</label
          >
          <select
            id="toUserId"
            v-model="formData.toUserId"
            required
            @change="onUserChange"
            class="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option disabled value="">Select a user</option>
            <option
              v-for="user in availableUsers"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }}
            </option>
          </select>
        </div>

        <!-- Skill Offered Dropdown -->
        <div class="mb-4">
          <label
            for="offeredSkillId"
            class="block mb-1 text-sm font-medium text-gray-700"
            >Skill you'll offer</label
          >
          <select
            id="offeredSkillId"
            v-model="formData.offeredSkillId"
            required
            :disabled="loadingCurrentUserSkills"
            class="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option disabled value="">Select your skill to offer</option>
            <option
              v-if="currentUserSkills.length === 0 && !loadingCurrentUserSkills"
              disabled
              value=""
            >
              You have no skills marked as 'teach'
            </option>
            <option v-if="loadingCurrentUserSkills" disabled value="">
              Loading your skills...
            </option>
            <option
              v-for="skill in currentUserSkills"
              :key="skill.id"
              :value="skill.id"
            >
              {{ skill.skill.name }}
            </option>
          </select>
        </div>

        <!-- Skill Requested Dropdown -->
        <div class="mb-4">
          <label
            for="requestedSkillId"
            class="block mb-1 text-sm font-medium text-gray-700"
            >Skill you want</label
          >
          <select
            id="requestedSkillId"
            v-model="formData.requestedSkillId"
            required
            :disabled="!formData.toUserId || loadingTargetUserSkills"
            class="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option disabled value="">
              {{
                formData.toUserId
                  ? loadingTargetUserSkills
                    ? "Loading skills..."
                    : "Select skill"
                  : "Select user first"
              }}
            </option>
            <option
              v-if="
                formData.toUserId &&
                !loadingTargetUserSkills &&
                targetUserSkills.length === 0
              "
              disabled
              value=""
            >
              User has no skills marked as 'teach'
            </option>
            <option
              v-for="skill in targetUserSkills"
              :key="skill.id"
              :value="skill.id"
            >
              {{ skill.skill.name }}
            </option>
          </select>
        </div>

        <!-- Message Textarea -->
        <div class="mb-6">
          <label
            for="message"
            class="block mb-1 text-sm font-medium text-gray-700"
            >Message (Optional)</label
          >
          <textarea
            id="message"
            v-model="formData.message"
            rows="3"
            class="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a note to introduce yourself or explain your request..."
          ></textarea>
        </div>

        <!-- Form Buttons -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="props.sendingRequest || !isFormValid"
          >
            <span
              v-if="props.sendingRequest"
              class="animate-spin mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full align-[-0.125em]"
            ></span>
            {{ props.sendingRequest ? "Sending..." : "Send Request" }}
          </button>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm mt-3 text-right">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  sendingRequest: Boolean,
  newRequestError: String,
  availableUsers: Array,
  currentUserSkills: Array,
  targetUserSkills: Array,
  loadingCurrentUserSkills: Boolean,
  loadingTargetUserSkills: Boolean,
});

const emit = defineEmits(["close", "submit", "user-selected"]);

// Local form state
const formData = ref({
  toUserId: "",
  offeredSkillId: "",
  requestedSkillId: "",
  message: "",
});

const errorMessage = ref("");

// Form validation
const isFormValid = computed(() => {
  return (
    formData.value.toUserId &&
    formData.value.offeredSkillId &&
    formData.value.requestedSkillId
  );
});

// Handle user selection change
const onUserChange = () => {
  if (formData.value.toUserId) {
    emit("user-selected", formData.value.toUserId);
  }
};

// Handle form submission
const submitForm = () => {
  if (!isFormValid.value) {
    errorMessage.value =
      "Please select a user, offered skill, and requested skill";
    return;
  }
  errorMessage.value = "";

  emit("submit", {
    toUserId: formData.value.toUserId,
    offeredSkillId: formData.value.offeredSkillId,
    requestedSkillId: formData.value.requestedSkillId,
    message: formData.value.message.trim() || undefined,
  });
};

// Reset form when modal closes
watch(
  () => props.newRequestError,
  (newVal) => {
    errorMessage.value = newVal;
  }
);
</script>
