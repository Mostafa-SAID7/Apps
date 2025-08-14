<template>
  <div class="input-container">
    <form @submit.prevent="sendMessage">
      <input
        v-model="message"
        type="text"
        placeholder="Type your message..."
        @keyup.enter="sendMessage"
      />
      <button type="submit" :disabled="!message.trim()">
        Send
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['send-message']);
const message = ref('');

const sendMessage = () => {
  if (message.value.trim()) {
    emit('send-message', message.value);
    message.value = '';
  }
};
</script>

<style scoped>
.input-container {
  padding: 1rem;
  background: white;
  border-top: 1px solid #eee;
}

form {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: #42b983;
}

button {
  background: #42b983;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #3aa876;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>