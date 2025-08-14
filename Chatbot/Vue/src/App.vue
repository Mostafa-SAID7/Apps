<template>
  <div class="chat-container">
    <header class="chat-header">
      <img src="" alt="Bot" class="bot-icon">
      <h1>Vue Chatbot</h1>
    </header>
    
    <div class="messages-container" ref="messagesContainer">
      <ChatMessage 
        v-for="(message, index) in messages" 
        :key="index" 
        :message="message"
      />
      <TypingIndicator v-if="isTyping" />
    </div>
    
    <MessageInput @send-message="handleSendMessage" />
  </div>
</template>

<script setup>
import { ref, onUpdated, nextTick } from 'vue';
import ChatMessage from './components/ChatMessage.vue';
import MessageInput from './components/MessageInput.vue';
import TypingIndicator from './components/TypingIndicator.vue';

const messages = ref([
  { text: "Hello! I'm your Vue chatbot. How can I help?", sender: 'bot' }
]);
const isTyping = ref(false);
const messagesContainer = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};

onUpdated(() => {
  scrollToBottom();
});

const handleSendMessage = async (messageText) => {
  // Add user message
  messages.value.push({ text: messageText, sender: 'user' });
  
  // Show typing indicator
  isTyping.value = true;
  
  // Simulate bot response delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate bot response
  const botResponse = generateBotResponse(messageText);
  messages.value.push({ text: botResponse, sender: 'bot' });
  
  // Hide typing indicator
  isTyping.value = false;
};

const generateBotResponse = (userMessage) => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return "Hi there! How can I assist you today?";
  } else if (lowerCaseMessage.includes('help')) {
    return "I can help you with Vue.js questions, general information, or just have a chat!";
  } else if (lowerCaseMessage.includes('vue')) {
    return "Vue.js is a progressive JavaScript framework for building user interfaces. What would you like to know about it?";
  } else if (lowerCaseMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help with?";
  } else {
    return "That's interesting. Could you tell me more?";
  }
};
</script>

<style>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.chat-header {
  background: #42b983;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.bot-icon {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
}
</style>