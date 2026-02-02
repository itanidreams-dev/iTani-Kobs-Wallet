<template>
  <div class="accounts">
    <h2>Accounts</h2>
    <button @click="createAccount">Create New Account</button>
    <div class="account-list">
      <div v-for="account in walletStore.accounts" :key="account.address" class="account-card">
        <p>Chain: {{ account.chain }}</p>
        <p>Address: {{ account.address }}</p>
        <p>Balance: {{ account.balance }}</p>
        <button @click="selectAccount(account)">Select</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'
import { generateMnemonic, mnemonicToSeedSync } from 'bip39'
import * as secp256k1 from 'secp256k1'

const walletStore = useWalletStore()

function createAccount() {
  // Simple account creation for demo - in real app, use proper key generation
  const privateKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privateKey[i] = Math.floor(Math.random() * 256);
  }
  const publicKey = secp256k1.publicKeyCreate(privateKey);
  const address = '0x' + Array.from(publicKey.slice(1) as Uint8Array).map((b) => b.toString(16).padStart(2, '0')).join('').slice(-40);

  const account = {
    address,
    privateKey: Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    chain: walletStore.currentChain,
    balance: '0',
  }
  walletStore.addAccount(account)
  walletStore.refreshBalance()
}

function selectAccount(account: any) {
  walletStore.switchChain(account.chain)
}
</script>

<style scoped>
.accounts {
  max-width: 800px;
  margin: 0 auto;
}

.account-list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.account-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}
</style>