<template>
  <div
    class="max-w-7xl mx-auto h-[calc(100vh-var(--header-height,80px)-2rem)] sm:h-[calc(100vh-var(--header-height,80px)-4rem)] my-4 sm:my-8"
  >
    <div class="flex h-full bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Left Panel -->
      <div
        class="w-full sm:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col"
      >
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800">Messages</h2>
        </div>

        <div class="flex-grow overflow-y-auto p-2 space-y-1">
          <div
            v-if="conversationsLoading"
            class="p-4 text-center text-gray-500 animate-pulse"
          >
            Loading conversations...
          </div>

          <div
            v-else-if="conversationsError"
            class="p-4 text-center text-red-500"
          >
            {{ conversationsError }}
          </div>

          <transition-group name="fade" tag="div">
            <ConversationListItem
              v-for="convo in conversations"
              :key="convo.id"
              :conversation="convo"
              :is-active="selectedConversationId === convo.id"
              @select="selectConversation"
            />
          </transition-group>

          <div
            v-if="
              !conversationsLoading &&
              !conversationsError &&
              conversations.length === 0
            "
            class="p-4 text-center text-gray-400 text-sm"
          >
            No conversations yet.
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="flex-1 flex flex-col bg-gray-50">
        <div v-if="selectedConversation" class="flex flex-col h-full">
          <div
            class="p-4 border-b border-gray-200 bg-white flex items-center justify-between"
          >
            <div class="flex items-center min-w-0">
              <img
                :src="
                  selectedConversation.user.avatarUrl ||
                  'https://i.pravatar.cc/150?u=' + selectedConversation.user.id
                "
                alt="User avatar"
                class="w-10 h-10 rounded-full mr-3 object-cover border"
              />
              <h3
                class="font-semibold text-gray-800 text-sm sm:text-lg truncate"
              >
                {{ selectedConversation.user.name }}
              </h3>
            </div>
          </div>

          <div
            ref="messagesContainerRef"
            class="flex-grow overflow-y-auto px-4 sm:px-6 py-3 space-y-3 sm:space-y-4 transition-all"
          >
            <div
              v-if="messagesLoading"
              class="text-center text-gray-500 animate-pulse"
            >
              Loading messages...
            </div>
            <div v-else-if="messagesError" class="text-center text-red-500">
              {{ messagesError }}
            </div>

            <transition-group name="fade" tag="div">
              <ChatMessage
                v-for="message in currentMessages"
                :key="message.id"
                :message="message"
                :is-sender="message.sender.id === currentUserId"
              />
            </transition-group>

            <div
              v-if="
                !messagesLoading &&
                !messagesError &&
                currentMessages.length === 0
              "
              class="text-center text-gray-400 text-sm"
            >
              No messages in this conversation yet. Send a message to start!
            </div>
          </div>

          <div class="p-4 border-t border-gray-200 bg-white">
            <form
              @submit.prevent="handleSendMessage"
              class="flex items-center gap-2"
            >
              <input
                type="text"
                v-model="newMessageText"
                placeholder="Type a message..."
                class="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                :disabled="messagesLoading || sendingMessage"
              />
              <button
                type="submit"
                class="bg-blue-600 text-white px-5 py-2 rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 disabled:opacity-50 text-sm"
                :disabled="
                  !newMessageText.trim() || messagesLoading || sendingMessage
                "
              >
                {{ sendingMessage ? "Sending..." : "Send" }}
              </button>
            </form>
          </div>
        </div>

        <div
          v-else
          class="flex-grow flex items-center justify-center text-gray-400 p-10 text-center"
        >
          <p v-if="!conversationsLoading && conversations.length > 0">
            Select a conversation to start chatting.
          </p>
          <p v-else-if="!conversationsLoading && conversations.length === 0">
            You have no active conversations.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/** Vue Composition API imports */
import { ref, computed, onMounted, nextTick, watch } from "vue";

/** Reusable component imports */
import ConversationListItem from "@/components/props/ConversationListItem.vue";
import ChatMessage from "@/components/props/ChatMessage.vue";

/** Auth store to get current user info */
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/providers/api/axios";

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

/** State for conversation and message management */
const conversations = ref([]);
const conversationsLoading = ref(true);
const conversationsError = ref(null);

const selectedConversationId = ref(null);
const currentMessages = ref([]);
const messagesLoading = ref(false);
const messagesError = ref(null);

const newMessageText = ref("");
const sendingMessage = ref(false);
const messagesContainerRef = ref(null);

const VITE_API_URL = "/messages";

/** Fetch all user conversations */
const fetchConversations = async () => {
  conversationsLoading.value = true;
  conversationsError.value = null;
  try {
    const response = await axiosInstance.get(`${VITE_API_URL}/conversations`);
    conversations.value = response.data.map((backendConvo) => {
      const userForListItem = {
        id: backendConvo.partner.id,
        name: backendConvo.partner.name,
        avatarUrl: backendConvo.partner.avatarUrl,
      };

      let skillsArray = [];
      if (backendConvo.skills) {
        if (backendConvo.skills.offered)
          skillsArray.push(backendConvo.skills.offered);
        if (backendConvo.skills.requested)
          skillsArray.push(backendConvo.skills.requested);
      }

      return {
        id: backendConvo.id,
        user: userForListItem,
        lastMessageSnippet:
          backendConvo.lastMessageSnippet || "No messages yet.",
        lastMessageTimestamp: backendConvo.lastMessageTimestamp
          ? new Date(backendConvo.lastMessageTimestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : backendConvo.createdAt
            ? new Date(backendConvo.createdAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
        unreadCount: backendConvo.unreadCount || 0,
        skills: skillsArray,
      };
    });
  } catch (err) {
    console.error(
      "Failed to fetch conversations:",
      err.response?.data || err.message
    );
    conversationsError.value =
      err.response?.data?.message || "Could not load conversations.";
  } finally {
    conversationsLoading.value = false;
  }
};

/** Fetch messages for a given conversation */
const fetchMessagesForConversation = async (conversationId) => {
  if (!conversationId) {
    currentMessages.value = [];
    return;
  }
  messagesLoading.value = true;
  messagesError.value = null;
  try {
    const response = await axiosInstance.get(
      `${VITE_API_URL}/conversation/${conversationId}`
    );
    currentMessages.value = response.data.map((msg) => ({
      ...msg,
      text: msg.content,
      timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    scrollToBottom();
  } catch (err) {
    console.error(
      `Failed to fetch messages for conversation ${conversationId}:`,
      err.response?.data || err.message
    );
    messagesError.value =
      err.response?.data?.message || "Could not load messages.";
  } finally {
    messagesLoading.value = false;
  }
};

/** Computed selected conversation based on selected ID */
const selectedConversation = computed(() =>
  conversations.value.find((c) => c.id === selectedConversationId.value)
);

/** Select a conversation and fetch its messages */
const selectConversation = (conversationId) => {
  if (
    selectedConversationId.value === conversationId &&
    currentMessages.value.length > 0
  )
    return;
  selectedConversationId.value = conversationId;
  const convo = conversations.value.find((c) => c.id === conversationId);
  if (convo) convo.unreadCount = 0; // Optimistically clear unread
  fetchMessagesForConversation(conversationId);
};

/** Send message logic */
const handleSendMessage = async () => {
  if (
    !newMessageText.value.trim() ||
    !selectedConversationId.value ||
    sendingMessage.value
  )
    return;

  sendingMessage.value = true;
  const textToSend = newMessageText.value;
  newMessageText.value = "";

  try {
    const payload = {
      content: textToSend,
      swapRequestId: selectedConversationId.value,
    };
    const response = await axiosInstance.post(`${VITE_API_URL}`, payload);
    const newSavedMessage = response.data;

    currentMessages.value.push({
      ...newSavedMessage,
      text: newSavedMessage.content,
      timestamp: new Date(newSavedMessage.sentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    const convo = conversations.value.find(
      (c) => c.id === selectedConversationId.value
    );
    if (convo) {
      convo.lastMessageSnippet = newSavedMessage.content;
      convo.lastMessageTimestamp = new Date(
        newSavedMessage.sentAt
      ).toLocaleString();
      conversations.value = [
        convo,
        ...conversations.value.filter((c) => c.id !== convo.id),
      ];
    }
    scrollToBottom();
  } catch (err) {
    console.error("Failed to send message:", err.response?.data || err.message);
    newMessageText.value = textToSend;
    alert(
      err.response?.data?.message || "Failed to send message. Please try again."
    );
  } finally {
    sendingMessage.value = false;
  }
};

/** Scroll to the bottom of the messages view */
const scrollToBottom = (behavior = "smooth") => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop =
        messagesContainerRef.value.scrollHeight;
    }
  });
};

/** Auto-scroll on new messages */
watch(currentMessages, () => scrollToBottom("smooth"), { deep: true });

/** Fetch conversations on mount */
onMounted(() => {
  if (!authStore.user && authStore.access_token && !authStore.isLoadingUser) {
    watch(
      () => authStore.user,
      (newUser) => {
        if (newUser) fetchConversations();
      },
      { once: true }
    );
  } else if (authStore.user) {
    fetchConversations();
  } else if (!authStore.isLoadingUser && !authStore.access_token) {
    console.warn(
      "MessagesView: User not authenticated. Conversations will not be loaded."
    );
    conversationsError.value = "Please log in to view your messages.";
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
