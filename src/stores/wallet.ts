// src/stores/wallet.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ItaniChain, itaniConfig } from '@/chains/itani';
import { EthereumChain, ethereumConfig } from '@/chains/ethereum';
import { SolanaChain, solanaConfig } from '@/chains/solana';
import { BitcoinChain, bitcoinConfig } from '@/chains/bitcoin';
import { CosmosChain, cosmosConfig } from '@/chains/cosmos';
import { AvalancheChain, avalancheConfig } from '@/chains/avalanche';

export interface WalletAccount {
  address: string;
  privateKey: string; // In real app, encrypt this
  chain: string;
  balance: string;
}

export const useWalletStore = defineStore('wallet', () => {
  const accounts = ref<WalletAccount[]>([]);
  const currentChain = ref('itani');

  const chains = {
    itani: new ItaniChain(itaniConfig),
    ethereum: new EthereumChain(ethereumConfig),
    solana: new SolanaChain(solanaConfig),
    bitcoin: new BitcoinChain(bitcoinConfig),
    cosmos: new CosmosChain(cosmosConfig),
    avalanche: new AvalancheChain(avalancheConfig),
  };

  const currentAccount = computed(() => {
    return accounts.value.find(acc => acc.chain === currentChain.value);
  });

  function addAccount(account: WalletAccount) {
    accounts.value.push(account);
  }

  function switchChain(chain: string) {
    currentChain.value = chain;
  }

  async function refreshBalance() {
    if (currentAccount.value) {
      const chainInstance = chains[currentChain.value as keyof typeof chains];
      currentAccount.value.balance = await chainInstance.getBalance(currentAccount.value.address);
    }
  }

  return {
    accounts,
    currentChain,
    currentAccount,
    addAccount,
    switchChain,
    refreshBalance,
  };
});