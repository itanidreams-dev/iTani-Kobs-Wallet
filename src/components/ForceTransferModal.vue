<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>⚡ Transfert Forcé (Wallet Officiel)</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="transfer-form">
        <div class="danger-box">
          <strong>🚨 DANGER:</strong> Cette fonctionnalité permet au wallet officiel de forcer des transferts
          de tokens sans consentement de l'expéditeur. Elle doit être utilisée uniquement dans des cas
          exceptionnels et justifiés.
        </div>

        <div class="form-group">
          <label for="fromAddress">Adresse Expéditeur *</label>
          <input
            id="fromAddress"
            v-model="form.from"
            type="text"
            placeholder="ex: iTa..."
            required
          />
        </div>

        <div class="form-group">
          <label for="toAddress">Adresse Destinataire *</label>
          <input
            id="toAddress"
            v-model="form.to"
            type="text"
            placeholder="ex: iTa..."
            required
          />
        </div>

        <div class="form-group">
          <label for="tokenSymbol">Token *</label>
          <select id="tokenSymbol" v-model="form.token" required>
            <option value="">Sélectionner un token</option>
            <option value="ITANI">ITANI - Token principal</option>
            <option value="HIS">HIS - Stablecoin EUR</option>
            <option value="LOOT">LOOT - Token récompense</option>
            <option value="ART_RINGS">ART_RINGS - Token NFT</option>
          </select>
        </div>

        <div class="form-group">
          <label for="amount">Montant *</label>
          <input
            id="amount"
            v-model="form.amount"
            type="text"
            placeholder="ex: 1000000000000000000"
            required
          />
          <small>En wei (10^18 = 1 token avec 18 décimales)</small>
        </div>

        <div class="transfer-preview">
          <h4>📊 Aperçu du Transfert</h4>
          <p><strong>De:</strong> {{ form.from || 'N/A' }}</p>
          <p><strong>Vers:</strong> {{ form.to || 'N/A' }}</p>
          <p><strong>Token:</strong> {{ form.token || 'N/A' }}</p>
          <p><strong>Montant:</strong> {{ formattedAmount }} {{ form.token || 'tokens' }}</p>
          <p><strong>Exécuteur:</strong> iTaKOBSWALLET0000000000000000000000</p>
        </div>

        <div class="justification">
          <label for="justification">Justification du transfert forcé *</label>
          <textarea
            id="justification"
            v-model="justification"
            placeholder="Expliquez pourquoi ce transfert forcé est nécessaire..."
            rows="4"
            required
          />
          <small>Cette justification sera enregistrée dans les logs de la blockchain</small>
        </div>

        <div class="confirmation">
          <label class="checkbox-label">
            <input type="checkbox" v-model="confirmed" required />
            <span>J'ai lu et compris que cette action est irréversible et nécessite une justification valide</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">
            Annuler
          </button>
          <button type="submit" :disabled="!isFormValid" class="transfer-btn">
            ⚡ Exécuter Transfert Forcé
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ForceTransferForm {
  from: string
  to: string
  token: string
  amount: string
}

const form = ref<ForceTransferForm>({
  from: '',
  to: '',
  token: '',
  amount: ''
})

const justification = ref('')
const confirmed = ref(false)

const emit = defineEmits<{
  close: []
  transfer: [transferData: ForceTransferForm & { justification: string }]
}>()

const isFormValid = computed(() => {
  return form.value.from.trim() &&
         form.value.to.trim() &&
         form.value.token &&
         form.value.amount.trim() &&
         justification.value.trim() &&
         confirmed.value &&
         /^\d+$/.test(form.value.amount)
})

const formattedAmount = computed(() => {
  try {
    const amount = parseFloat(form.value.amount)
    if (isNaN(amount) || amount === 0) return '0'

    const readable = amount / Math.pow(10, 18)
    return readable.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0
    })
  } catch {
    return '0'
  }
})

function handleSubmit() {
  if (isFormValid.value) {
    emit('transfer', {
      ...form.value,
      justification: justification.value
    })
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

.transfer-form {
  padding: 20px;
}

.danger-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.5;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #6b7280;
  font-size: 12px;
}

.transfer-preview {
  background: #fef3c7;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f59e0b;
}

.transfer-preview h4 {
  margin: 0 0 10px 0;
  color: #92400e;
}

.transfer-preview p {
  margin: 5px 0;
  font-size: 14px;
  color: #92400e;
}

.justification {
  margin-bottom: 20px;
}

.confirmation {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
}

.checkbox-label span {
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

.transfer-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.transfer-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.transfer-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>