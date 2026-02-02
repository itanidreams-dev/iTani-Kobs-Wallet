<template>
  <div class="accounts">
    <h2>Accounts</h2>
    <button @click="createAccount">Create New Account</button>
    <div class="account-list">
      <div v-for="account in userAccounts" :key="account.address" class="account-card">
        <p>Chain: {{ account.chain }}</p>
        <p>Address: {{ account.address }}</p>
        <p>Balance: {{ account.balance }}</p>
        <button @click="selectAccount(account)">Select</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPublicKey } from '@noble/secp256k1'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const userAccounts = computed(() => walletStore.userAccounts)

async function createAccount() {
  // Simple account creation for demo - in real app, use proper key generation
  const privateKey = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    privateKey[i] = Math.floor(Math.random() * 256)
  }
  const publicKey = getPublicKey(privateKey, false)
  const address =
    '0x' +
    Array.from(publicKey.slice(1))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(-40)

  if (!walletStore.currentUserEmail) return

  const privateKeyHex = Array.from(privateKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const account = {
    address,
    encryptedPrivateKey: walletStore.encryptPrivateKey(privateKeyHex, walletStore.currentUserEmail),
    ownerEmail: walletStore.currentUserEmail,
    chain: walletStore.currentChain,
    balance: '0',
  }
  walletStore.addAccount(account)
  await walletStore.refreshBalance()
}

function selectAccount(account: { chain: string }) {
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