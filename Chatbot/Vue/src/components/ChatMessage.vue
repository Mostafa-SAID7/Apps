<template>
  <div class="message" :class="messageClass">
    <div class="message-content">{{ message.text }}</div>
    <div class="message-time">{{ formattedTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const messageClass = computed(() => ({
  'user-message': props.message.sender === 'user',
  'bot-message': props.message.sender === 'bot'
}));

const formattedTime = computed(() => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<style scoped>
.message {
  margin-bottom: 1rem;
  max-width: 70%;
  padding: 0.75rem;
  border-radius: 18px;
  position: relative;
}

.user-message {
  background: #42b983;
  color: white;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 5px;
}

.bot-message {
  background: white;
  color: #333;
  border-bottom-left-radius: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  text-align: right;
}

.bot-message .message-time {
  text-align: left;
}
</style>