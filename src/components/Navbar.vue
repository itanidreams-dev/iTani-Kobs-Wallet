<template>
  <nav class="navbar">
    <div class="logo">
      <h1>iTani Kobs Wallet</h1>
    </div>
    <div class="nav-links">
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/accounts">Accounts</RouterLink>
      <RouterLink to="/send">Send</RouterLink>
      <RouterLink to="/swap">Swap</RouterLink>
      <RouterLink to="/history">History</RouterLink>
    </div>
    <div class="chain-selector">
      <select v-model="walletStore.currentChain" @change="walletStore.refreshBalance()">
        <option value="itani">iTani</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
        <option value="bitcoin">Bitcoin</option>
        <option value="cosmos">Cosmos</option>
        <option value="avalanche">Avalanche</option>
      </select>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #007bff;
}

.chain-selector select {
  padding: 5px;
}
</style>