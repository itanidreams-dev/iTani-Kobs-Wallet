<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPublicKey } from '@noble/secp256k1'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const walletStore = useWalletStore()

const privateKeyHex = ref('')
const selectedChain = ref(walletStore.currentChain)
const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function validateImport() {
  errorMessage.value = ''

  const trimmedEmail = walletStore.normalizeEmail(email.value)
  if (!trimmedEmail || !password.value) {
    errorMessage.value = 'Email et mot de passe requis.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errorMessage.value = 'Email invalide.'
    return
  }

  if (walletStore.hasUser(trimmedEmail)) {
    errorMessage.value = 'Un compte existe déjà avec cet email.'
    return
  }

  const normalized = privateKeyHex.value.trim().replace(/^0x/i, '')
  if (!/^[0-9a-fA-F]{64}$/.test(normalized)) {
    errorMessage.value = 'Clé privée invalide. Utilise 64 caractères hexadécimaux.'
    return
  }

  const privateKey = new Uint8Array(
    normalized.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  )

  if (privateKey.length !== 32) {
    errorMessage.value = 'Clé privée invalide.'
    return
  }

  const publicKey = getPublicKey(privateKey, false)
  const address =
    '0x' +
    Array.from(publicKey.slice(1))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(-40)

  const account = {
    address,
    encryptedPrivateKey: walletStore.encryptPrivateKey(normalized.toLowerCase(), trimmedEmail),
    ownerEmail: trimmedEmail,
    chain: selectedChain.value,
    balance: '0',
  }

  walletStore.addUser({
    email: trimmedEmail,
    passwordHash: walletStore.hashPassword(password.value),
  })
  walletStore.addAccount(account)
  walletStore.switchChain(selectedChain.value)
  await walletStore.refreshBalance()
  walletStore.setAuthenticated(true, trimmedEmail)
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="auth-form">
    <h2>Importer un wallet</h2>
    <p class="subtitle">Colle ta clé privée pour importer un wallet existant.</p>

    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="toi@exemple.com" />
    </div>

    <div class="form-group">
      <label for="password">Mot de passe</label>
      <input id="password" v-model="password" type="password" placeholder="••••••••" />
    </div>

    <div class="form-group">
      <label for="privateKey">Clé privée (hex)</label>
      <input
        id="privateKey"
        v-model="privateKeyHex"
        type="text"
        placeholder="0x..."
        autocomplete="off"
      />
    </div>

    <div class="form-group">
      <label for="chain">Chaîne</label>
      <select id="chain" v-model="selectedChain">
        <option value="itani">iTani</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
        <option value="bitcoin">Bitcoin</option>
        <option value="cosmos">Cosmos</option>
        <option value="avalanche">Avalanche</option>
      </select>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="actions">
      <button class="primary" @click="validateImport">Valider</button>
      <RouterLink class="link" to="/login">Retour à la connexion</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 520px;
  margin: 40px auto 0;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: white;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

input,
select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ced4da;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.primary {
  background: #0d6efd;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.link {
  color: #0d6efd;
  text-decoration: none;
}

.error {
  color: #dc3545;
  margin-bottom: 12px;
}
</style>
