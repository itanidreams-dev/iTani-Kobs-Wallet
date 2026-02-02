<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>🏭 Mint de Tokens (Wallet Officiel)</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="mint-form">
        <div class="warning-box">
          <strong>⚠️ Attention:</strong> Cette fonctionnalité est réservée au wallet officiel iTani Kobs.
          Elle permet de créer de nouveaux tokens via le smart contract KobsTokenFactory.
        </div>

        <div class="form-group">
          <label for="tokenName">Nom du Token *</label>
          <input
            id="tokenName"
            v-model="form.name"
            type="text"
            placeholder="ex: Caribbean Dollar"
            required
          />
        </div>

        <div class="form-group">
          <label for="tokenSymbol">Symbole *</label>
          <input
            id="tokenSymbol"
            v-model="form.symbol"
            type="text"
            placeholder="ex: CAD"
            maxlength="10"
            required
          />
          <small>Symbole unique, majuscules recommandées</small>
        </div>

        <div class="form-group">
          <label for="totalSupply">Supply Totale *</label>
          <input
            id="totalSupply"
            v-model="form.totalSupply"
            type="text"
            placeholder="ex: 1000000000000000000000000000"
            required
          />
          <small>En wei (10^18 = 1 token avec 18 décimales)</small>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Description détaillée du token..."
            rows="3"
            required
          />
        </div>

        <div class="supply-preview">
          <h4>📊 Aperçu du Token</h4>
          <p><strong>Nom:</strong> {{ form.name || 'N/A' }}</p>
          <p><strong>Symbole:</strong> {{ form.symbol || 'N/A' }}</p>
          <p><strong>Supply lisible:</strong> {{ formattedSupply }} {{ form.symbol || 'TOKEN' }}</p>
          <p><strong>Décimales:</strong> 18</p>
          <p><strong>Contrôleur:</strong> iTaKOBSWALLET0000000000000000000000</p>
        </div>

        <div class="examples">
          <h4>💡 Exemples de Stablecoins</h4>
          <div class="example-grid">
            <div class="example-card" @click="loadExample('Caribbean Dollar', 'CAD', '1000000000000000000000000000', 'Stablecoin 1:1 USD - Soutenu par les devises caribéennes (HTG, DOP, etc.)')">
              <h5>Caribbean Dollar</h5>
              <p>CAD - 1,000,000,000 tokens</p>
            </div>
            <div class="example-card" @click="loadExample('Euro Caribbean', 'EURC', '500000000000000000000000000', 'Stablecoin 1:1 EUR - Soutenu par l\'euro européen')">
              <h5>Euro Caribbean</h5>
              <p>EURC - 500,000,000 tokens</p>
            </div>
            <div class="example-card" @click="loadExample('iTani Gold', 'ITG', '10000000000000000000000000', 'Token adossé à l\'or - 1 ITG = 1g d\'or')">
              <h5>iTani Gold</h5>
              <p>ITG - 10,000,000 tokens</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            Annuler
          </button>
          <button type="submit" :disabled="!isFormValid" class="mint-btn">
            🏭 Mint Token
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface MintTokenForm {
  name: string
  symbol: string
  totalSupply: string
  description: string
}

const form = ref<MintTokenForm>({
  name: '',
  symbol: '',
  totalSupply: '',
  description: ''
})

const emit = defineEmits<{
  close: []
  mint: [tokenData: MintTokenForm]
}>()

const isFormValid = computed(() => {
  return form.value.name.trim() &&
         form.value.symbol.trim() &&
         form.value.totalSupply.trim() &&
         form.value.description.trim() &&
         /^\d+$/.test(form.value.totalSupply)
})

const formattedSupply = computed(() => {
  try {
    const supply = parseFloat(form.value.totalSupply)
    if (isNaN(supply) || supply === 0) return '0'

    const readable = supply / Math.pow(10, 18)
    return readable.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })
  } catch {
    return '0'
  }
})

function loadExample(name: string, symbol: string, totalSupply: string, description: string) {
  form.value = {
    name,
    symbol,
    totalSupply,
    description
  }
}

function handleSubmit() {
  if (isFormValid.value) {
    emit('mint', { ...form.value })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #dc2626;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.mint-form {
  padding: 20px;
}

.warning-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #92400e;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #6b7280;
  font-size: 12px;
}

.supply-preview {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #bae6fd;
}

.supply-preview h4 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.supply-preview p {
  margin: 5px 0;
  font-size: 14px;
  color: #1e40af;
}

.examples {
  margin-bottom: 20px;
}

.examples h4 {
  color: #1f2937;
  margin-bottom: 10px;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.example-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.example-card:hover {
  background: #e2e8f0;
  border-color: #2563eb;
}

.example-card h5 {
  margin: 0 0 5px 0;
  color: #1f2937;
  font-size: 14px;
}

.example-card p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.mint-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.mint-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.mint-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>