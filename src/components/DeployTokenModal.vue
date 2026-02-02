<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>🚀 Déployer un Nouveau Token</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="deploy-form">
        <div class="form-group">
          <label for="tokenName">Nom du Token *</label>
          <input
            id="tokenName"
            v-model="form.name"
            type="text"
            placeholder="ex: My Custom Token"
            required
          />
        </div>

        <div class="form-group">
          <label for="tokenSymbol">Symbole *</label>
          <input
            id="tokenSymbol"
            v-model="form.symbol"
            type="text"
            placeholder="ex: MCT"
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
            placeholder="ex: 1000000000000000000000"
            required
          />
          <small>En wei (10^18 = 1 token avec 18 décimales)</small>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Description du token..."
            rows="3"
          />
        </div>

        <div class="supply-preview">
          <h4>📊 Aperçu</h4>
          <p><strong>Supply lisible:</strong> {{ formattedSupply }} {{ form.symbol || 'TOKEN' }}</p>
          <p><strong>Décimales:</strong> 18 (standard ERC-20)</p>
          <p><strong>Type:</strong> ITANI-20 (fungible)</p>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            Annuler
          </button>
          <button type="submit" :disabled="!isFormValid" class="deploy-btn">
            🚀 Déployer Token
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DeployTokenForm {
  name: string
  symbol: string
  totalSupply: string
  description: string
}

const form = ref<DeployTokenForm>({
  name: '',
  symbol: '',
  totalSupply: '',
  description: ''
})

const emit = defineEmits<{
  close: []
  deploy: [tokenData: DeployTokenForm]
}>()

const isFormValid = computed(() => {
  return form.value.name.trim() &&
         form.value.symbol.trim() &&
         form.value.totalSupply.trim() &&
         /^\d+$/.test(form.value.totalSupply) // Vérifier que c'est un nombre
})

const formattedSupply = computed(() => {
  try {
    const supply = parseFloat(form.value.totalSupply)
    if (isNaN(supply) || supply === 0) return '0'

    // Convertir de wei vers unités lisibles
    const readable = supply / Math.pow(10, 18)
    return readable.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })
  } catch {
    return '0'
  }
})

function handleSubmit() {
  if (isFormValid.value) {
    emit('deploy', { ...form.value })
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
  max-width: 500px;
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
  color: #1f2937;
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

.deploy-form {
  padding: 20px;
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
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.supply-preview h4 {
  margin: 0 0 10px 0;
  color: #1f2937;
}

.supply-preview p {
  margin: 5px 0;
  font-size: 14px;
  color: #374151;
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

.deploy-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.deploy-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.deploy-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>