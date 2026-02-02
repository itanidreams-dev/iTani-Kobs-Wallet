<template>
  <div class="send">
    <h2>Send</h2>
    <form @submit.prevent="sendTransaction">
      <input v-model="to" placeholder="Recipient Address" required />
      <input v-model="amount" type="number" placeholder="Amount" required />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const to = ref('')
const amount = ref('')

async function sendTransaction() {
  // Implement send logic based on chain
  console.log('Sending', amount.value, 'to', to.value)
  // Call chain.sendTransaction
}
</script>

<style scoped>
.send {
  max-width: 400px;
  margin: 0 auto;
}
</style>