<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(routeName: 'login' | 'signup' | 'import-wallet') {
  router.push({ name: routeName })
}
</script>

<template>
  <div class="auth">
    <div class="auth-header">
      <h1>iTani Kobs Wallet</h1>
      <p>Connecte-toi, crée un compte ou importe un wallet pour continuer.</p>
    </div>

    <div class="auth-actions">
      <button class="primary" @click="goTo('login')">Connexion</button>
      <button @click="goTo('signup')">Inscription</button>
      <button @click="goTo('import-wallet')">Importer un wallet</button>
    </div>
  </div>
</template>

<style scoped>
.auth {
  max-width: 720px;
  margin: 40px auto 0;
  text-align: center;
}

.auth-header h1 {
  margin-bottom: 10px;
}

.auth-header p {
  color: #6c757d;
  margin-bottom: 30px;
}

.auth-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.auth-actions button {
  border: 1px solid #ced4da;
  background: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.auth-actions button.primary {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}
</style>
