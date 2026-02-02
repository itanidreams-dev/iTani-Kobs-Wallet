<template>
  <nav class="navbar">
    <div class="logo">
      <h1>iTani Kobs Wallet</h1>
    </div>
    <div v-if="walletStore.isAuthenticated" class="nav-links">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/accounts">Accounts</RouterLink>
      <RouterLink to="/send">Send</RouterLink>
      <RouterLink to="/swap">Swap</RouterLink>
      <RouterLink to="/history">History</RouterLink>
    </div>
    <div v-if="walletStore.isAuthenticated" class="chain-selector">
      <select v-model="walletStore.currentChain" @change="walletStore.refreshBalance()">
        <option value="itani">iTani</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
        <option value="bitcoin">Bitcoin</option>
        <option value="cosmos">Cosmos</option>
        <option value="avalanche">Avalanche</option>
      </select>
    </div>
    <div v-if="walletStore.isAuthenticated" class="network-toggle">
      <button 
        type="button" 
        class="network-btn" 
        :class="{ 'mainnet': walletStore.isMainnet }"
        @click="walletStore.toggleNetwork()"
      >
        {{ walletStore.isMainnet ? 'RÉEL' : 'DÉMO' }}
      </button>
    </div>
    <div v-if="walletStore.isAuthenticated" class="auth-actions">
      <button type="button" class="logout" @click="logout">Déconnexion</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

function logout() {
  walletStore.logout()
}
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

.network-toggle {
  margin-left: 10px;
}

.network-btn {
  padding: 8px 16px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.network-btn:hover {
  background: #007bff;
  color: white;
}

.network-btn.mainnet {
  border-color: #dc3545;
  color: #dc3545;
}

.network-btn.mainnet:hover {
  background: #dc3545;
  color: white;
}

.auth-actions {
  display: flex;
  align-items: center;
}

.logout {
  background: none;
  border: 1px solid #ced4da;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>