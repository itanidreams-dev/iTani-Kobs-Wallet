<template>
  <div class="dashboard">
    <div class="header">
      <h2>🏦 iTani Kobs Wallet Dashboard</h2>
      <p class="subtitle">Portefeuille officiel de l'écosystème iTani Network Chain</p>
    </div>

    <div v-if="walletStore.currentAccount" class="account-section">
      <div class="account-info">
        <h3>📍 Compte Actif</h3>
        <p><strong>Adresse:</strong> {{ walletStore.currentAccount.address }}</p>
        <p><strong>Réseau:</strong> {{ getChainDisplayName(walletStore.currentChain) }}</p>
        <button @click="refreshBalances" :disabled="loading" class="refresh-btn">
          {{ loading ? '🔄 Actualisation...' : '🔄 Actualiser' }}
        </button>
      </div>

      <!-- Tokens iTani (Priorité absolue) -->
      <div v-if="walletStore.currentChain === 'itani'" class="tokens-section">
        <h3>💎 Tokens iTani Network</h3>
        <div class="tokens-grid">
          <div
            v-for="tokenBalance in walletStore.formattedTokenBalances"
            :key="tokenBalance.symbol"
            class="token-card"
            :class="{ 'native-token': tokenBalance.token.isNative }"
          >
            <div class="token-header">
              <h4>{{ tokenBalance.token.name }}</h4>
              <span class="token-symbol">{{ tokenBalance.token.symbol }}</span>
            </div>
            <div class="token-balance">
              <span class="balance-amount">{{ tokenBalance.formattedBalance }}</span>
              <span class="balance-symbol">{{ tokenBalance.token.symbol }}</span>
            </div>
            <div class="token-description">
              {{ tokenBalance.token.description }}
            </div>
            <div class="token-actions">
              <button @click="sendToken(tokenBalance.token)" class="action-btn send">
                📤 Envoyer
              </button>
              <button @click="receiveToken(tokenBalance.token)" class="action-btn receive">
                📥 Recevoir
              </button>
              <button
                v-if="isOfficialWallet && tokenBalance.token.symbol !== 'ITANI'"
                @click="mintToken(tokenBalance.token)"
                class="action-btn mint"
              >
                🏭 Mint
              </button>
            </div>
          </div>
        </div>

        <!-- Section de déploiement de tokens (réservée au wallet officiel) -->
        <div v-if="isOfficialWallet" class="admin-section">
          <h3>⚡ Contrôles Administrateur (Wallet Officiel)</h3>
          <div class="admin-actions">
            <button @click="showDeployTokenModal = true" class="admin-btn">
              🚀 Déployer Nouveau Token
            </button>
            <button @click="showMintModal = true" class="admin-btn">
              🏭 Mint Tokens Existants
            </button>
            <button @click="showForceTransferModal = true" class="admin-btn">
              ⚡ Transfert Forcé
            </button>
          </div>
        </div>
      </div>

      <!-- Autres chaînes -->
      <div v-else class="other-chain-section">
        <h3>💰 Balance {{ getChainDisplayName(walletStore.currentChain) }}</h3>
        <div class="balance-display">
          <span class="balance-amount">{{ formatBalance(walletStore.currentAccount.balance) }}</span>
          <span class="balance-symbol">{{ walletStore.currentChain.toUpperCase() }}</span>
        </div>
      </div>
    </div>

    <div v-else class="no-account">
      <p>❌ Aucun compte sélectionné.</p>
      <RouterLink to="/accounts" class="create-account-link">
        Créer ou importer un compte →
      </RouterLink>
    </div>

    <!-- Modals pour les actions administrateur -->
    <DeployTokenModal
      v-if="showDeployTokenModal"
      @close="showDeployTokenModal = false"
      @deploy="handleDeployToken"
    />
    <MintTokenModal
      v-if="showMintModal"
      @close="showMintModal = false"
      @mint="handleMintToken"
    />
    <ForceTransferModal
      v-if="showForceTransferModal"
      @close="showForceTransferModal = false"
      @transfer="handleForceTransfer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { ITANI_TOKENS } from '@/chains/itani'
import DeployTokenModal from '@/components/DeployTokenModal.vue'
import MintTokenModal from '@/components/MintTokenModal.vue'
import ForceTransferModal from '@/components/ForceTransferModal.vue'

const walletStore = useWalletStore()
const loading = ref(false)
const showDeployTokenModal = ref(false)
const showMintModal = ref(false)
const showForceTransferModal = ref(false)

// Vérifier si c'est le wallet officiel
const isOfficialWallet = computed(() => {
  return walletStore.currentAccount?.address === 'iTaKOBSWALLET0000000000000000000000'
})

function getChainDisplayName(chain: string): string {
  const names: {[key: string]: string} = {
    itani: 'iTani Network Chain',
    ethereum: 'Ethereum',
    solana: 'Solana',
    bitcoin: 'Bitcoin',
    cosmos: 'Cosmos',
    avalanche: 'Avalanche'
  }
  return names[chain] || chain
}

async function refreshBalances() {
  loading.value = true
  try {
    if (walletStore.currentChain === 'itani') {
      await walletStore.refreshAllTokenBalances()
    } else {
      await walletStore.refreshBalance()
    }
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
  } finally {
    loading.value = false
  }
}

function sendToken(token: any) {
  // TODO: Implémenter l'envoi de tokens
  alert(`Fonctionnalité d'envoi pour ${token.symbol} - Bientôt disponible`)
}

function receiveToken(token: any) {
  // TODO: Implémenter la réception de tokens
  alert(`Adresse de réception: ${walletStore.currentAccount?.address}`)
}

function mintToken(token: any) {
  if (!isOfficialWallet.value) {
    alert('Cette fonctionnalité est réservée au wallet officiel iTani Kobs')
    return
  }
  // TODO: Implémenter le mint de tokens
  alert(`Mint de ${token.symbol} - Fonctionnalité réservée au wallet officiel`)
}

async function handleDeployToken(tokenData: any) {
  try {
    await walletStore.createCustomToken(tokenData.name, tokenData.symbol, tokenData.totalSupply)
    alert('Token déployé avec succès!')
    showDeployTokenModal.value = false
    await refreshBalances()
  } catch (error) {
    alert('Erreur lors du déploiement: ' + error)
  }
}

async function handleMintToken(mintData: any) {
  try {
    await walletStore.mintTokens(mintData.name, mintData.symbol, mintData.totalSupply, mintData.description)
    alert('Tokens mintés avec succès!')
    showMintModal.value = false
    await refreshBalances()
  } catch (error) {
    alert('Erreur lors du mint: ' + error)
  }
}

async function handleForceTransfer(transferData: any) {
  try {
    await walletStore.forceTransfer(transferData.from, transferData.to, transferData.token, transferData.amount)
    alert('Transfert forcé exécuté avec succès!')
    showForceTransferModal.value = false
    await refreshBalances()
  } catch (error) {
    alert('Erreur lors du transfert: ' + error)
  }
}

function formatBalance(balance: string): string {
  try {
    const balanceNum = parseFloat(balance)
    if (balanceNum === 0) return "0"

    // Convertir de wei vers ETH pour les autres chaînes
    const readable = balanceNum / Math.pow(10, 18)
    return readable.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0
    })
  } catch {
    return balance
  }
}

onMounted(() => {
  if (walletStore.currentChain === 'itani' && walletStore.currentAccount) {
    refreshBalances()
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2563eb;
  margin-bottom: 5px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
}

.account-section {
  display: grid;
  gap: 30px;
}

.account-info {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.account-info h3 {
  margin-top: 0;
  color: #1f2937;
}

.refresh-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.refresh-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tokens-section h3,
.other-chain-section h3 {
  color: #1f2937;
  margin-bottom: 20px;
}

.tokens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.token-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.token-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.native-token {
  border-left: 4px solid #2563eb;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.token-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.token-header h4 {
  margin: 0;
  color: #1f2937;
}

.token-symbol {
  background: #2563eb;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.token-balance {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.balance-amount {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-right: 8px;
}

.balance-symbol {
  color: #6b7280;
  font-size: 16px;
}

.token-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.token-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.action-btn.send {
  background: #10b981;
  color: white;
}

.action-btn.send:hover {
  background: #059669;
}

.action-btn.receive {
  background: #f59e0b;
  color: white;
}

.action-btn.receive:hover {
  background: #d97706;
}

.action-btn.mint {
  background: #8b5cf6;
  color: white;
}

.action-btn.mint:hover {
  background: #7c3aed;
}

.admin-section {
  margin-top: 40px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.admin-section h3 {
  color: #dc2626;
  margin-top: 0;
}

.admin-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.admin-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.admin-btn:hover {
  background: #b91c1c;
}

.other-chain-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.balance-display {
  display: flex;
  align-items: baseline;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.no-account {
  text-align: center;
  padding: 40px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.create-account-link {
  display: inline-block;
  margin-top: 15px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.create-account-link:hover {
  text-decoration: underline;
}
</style>