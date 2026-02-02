<template>
  <div class="dashboard">
    <h2>Dashboard</h2>
    <div v-if="walletStore.currentAccount" class="account-info">
      <p>Address: {{ walletStore.currentAccount.address }}</p>
      <p>Balance: {{ walletStore.currentAccount.balance }} {{ walletStore.currentChain.toUpperCase() }}</p>
      <button @click="walletStore.refreshBalance()">Refresh Balance</button>
    </div>
    <div v-else>
      <p>No account selected. Go to <RouterLink to="/accounts">Accounts</RouterLink> to create or import one.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
}

.account-info {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}
</style>