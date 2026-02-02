<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const walletStore = useWalletStore()
const errorMessage = ref('')

const email = ref('')
const password = ref('')

function validateLogin() {
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

  if (!walletStore.validateUser(trimmedEmail, password.value)) {
    errorMessage.value = 'Identifiants incorrects.'
    return
  }

  walletStore.setAuthenticated(true, trimmedEmail)
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="auth-form">
    <h2>Connexion</h2>
    <p class="subtitle">Connecte-toi avec ton email et mot de passe.</p>

    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="toi@exemple.com" />
    </div>

    <div class="form-group">
      <label for="password">Mot de passe</label>
      <input id="password" v-model="password" type="password" placeholder="••••••••" />
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="actions">
      <button class="primary" @click="validateLogin">Valider</button>
      <RouterLink class="link" to="/signup">Créer un compte</RouterLink>
      <RouterLink class="link" to="/import-wallet">Importer un wallet</RouterLink>
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
