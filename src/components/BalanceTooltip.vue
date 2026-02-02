<template>
  <div
    v-if="walletStore.currentAccount"
    ref="balanceTooltip"
    class="balance-tooltip"
    :class="{ blurred: isBlurred }"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div class="balance-content">
      <span class="chain">{{ walletStore.currentChain.toUpperCase() }}</span>
      <span class="address">{{ walletStore.currentAccount.address.slice(0, 6) }}...{{ walletStore.currentAccount.address.slice(-4) }}</span>
      <span class="balance">{{ walletStore.currentAccount.balance }}</span>
    </div>
    <button @click="toggleBlur" class="blur-btn">{{ isBlurred ? '👁️' : '🙈' }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const balanceTooltip = ref<HTMLElement>()
const isBlurred = ref(false)
let isDragging = false
let startX = 0
let startY = 0
let initialX = 0
let initialY = 0

function startDrag(event: MouseEvent | TouchEvent) {
  if (!balanceTooltip.value) return
  isDragging = true
  const clientX = 'touches' in event ? event.touches?.[0]?.clientX : event.clientX
  const clientY = 'touches' in event ? event.touches?.[0]?.clientY : event.clientY
  startX = clientX ?? 0
  startY = clientY ?? 0
  const rect = balanceTooltip.value.getBoundingClientRect()
  initialX = rect.left
  initialY = rect.top

  document.addEventListener('mousemove', drag)
  document.addEventListener('touchmove', drag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

function drag(event: MouseEvent | TouchEvent) {
  if (!isDragging || !balanceTooltip.value) return
  event.preventDefault()
  const clientX = 'touches' in event ? event.touches?.[0]?.clientX : event.clientX
  const clientY = 'touches' in event ? event.touches?.[0]?.clientY : event.clientY
  const dx = (clientX ?? 0) - startX
  const dy = (clientY ?? 0) - startY
  balanceTooltip.value.style.left = `${initialX + dx}px`
  balanceTooltip.value.style.top = `${initialY + dy}px`
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('touchmove', drag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}

function toggleBlur() {
  isBlurred.value = !isBlurred.value
}

onMounted(() => {
  if (balanceTooltip.value) {
    balanceTooltip.value.style.position = 'fixed'
    balanceTooltip.value.style.top = '20px'
    balanceTooltip.value.style.right = '20px'
    balanceTooltip.value.style.zIndex = '1000'
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('touchmove', drag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.balance-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: move;
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.balance-tooltip.blurred {
  filter: blur(4px);
}

.balance-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chain {
  font-size: 12px;
  opacity: 0.8;
}

.address {
  font-size: 10px;
  opacity: 0.7;
}

.balance {
  font-size: 16px;
  font-weight: bold;
}

.blur-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
}
</style>