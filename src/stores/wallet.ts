// src/stores/wallet.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ItaniChain, itaniConfig, ITANI_TOKENS, ItaniToken } from '@/chains/itani';
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
  tokenBalances?: {[symbol: string]: string};
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  formattedBalance: string;
  token: ItaniToken;
}

export const useWalletStore = defineStore('wallet', () => {
  const accounts = ref<WalletAccount[]>([]);
  const currentChain = ref('itani');
  const currentTokenBalances = ref<TokenBalance[]>([]);

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

  // Tokens iTani prioritaires
  const itaniTokens = computed(() => ITANI_TOKENS);

  // Balances formatées pour l'affichage
  const formattedTokenBalances = computed(() => {
    return currentTokenBalances.value.map(balance => ({
      ...balance,
      formattedBalance: formatBalance(balance.balance, balance.token.decimals)
    }));
  });

  function addAccount(account: WalletAccount) {
    accounts.value.push(account);
  }

  function switchChain(chain: string) {
    currentChain.value = chain;
    // Recharger les balances quand on change de chaîne
    if (chain === 'itani') {
      refreshAllTokenBalances();
    }
  }

  async function refreshBalance() {
    if (currentAccount.value) {
      const chainInstance = chains[currentChain.value as keyof typeof chains];
      currentAccount.value.balance = await chainInstance.getBalance(currentAccount.value.address);
    }
  }

  async function refreshAllTokenBalances() {
    if (currentAccount.value && currentChain.value === 'itani') {
      const itaniChain = chains.itani as ItaniChain;
      try {
        const balances = await itaniChain.getAllBalances(currentAccount.value.address);
        currentTokenBalances.value = ITANI_TOKENS.map(token => ({
          symbol: token.symbol,
          balance: balances[token.symbol] || "0",
          formattedBalance: "",
          token
        }));
      } catch (error) {
        console.error("Erreur lors du chargement des balances:", error);
        // En cas d'erreur, définir toutes les balances à 0
        currentTokenBalances.value = ITANI_TOKENS.map(token => ({
          symbol: token.symbol,
          balance: "0",
          formattedBalance: "0",
          token
        }));
      }
    }
  }

  // Méthodes spéciales pour le wallet officiel iTani Kobs
  async function deployContract(name: string, wasmBase64: string) {
    if (currentChain.value === 'itani') {
      const itaniChain = chains.itani as ItaniChain;
      return await itaniChain.deployContract(name, wasmBase64);
    }
    throw new Error("Cette fonctionnalité n'est disponible que sur iTani Network Chain");
  }

  async function mintTokens(tokenName: string, symbol: string, totalSupply: string, description?: string) {
    if (currentChain.value === 'itani') {
      const itaniChain = chains.itani as ItaniChain;
      const result = await itaniChain.mintTokens(tokenName, symbol, totalSupply, description);
      // Recharger les balances après mint
      await refreshAllTokenBalances();
      return result;
    }
    throw new Error("Cette fonctionnalité n'est disponible que sur iTani Network Chain");
  }

  async function forceTransfer(from: string, to: string, token: string, amount: string) {
    if (currentChain.value === 'itani') {
      const itaniChain = chains.itani as ItaniChain;
      return await itaniChain.forceTransfer(from, to, token, amount);
    }
    throw new Error("Cette fonctionnalité n'est disponible que sur iTani Network Chain");
  }

  async function createCustomToken(name: string, symbol: string, totalSupply: string) {
    if (currentAccount.value && currentChain.value === 'itani') {
      const itaniChain = chains.itani as ItaniChain;
      return await itaniChain.createCustomToken(name, symbol, totalSupply, currentAccount.value.address);
    }
    throw new Error("Aucun compte actif ou chaîne incorrecte");
  }

  return {
    accounts,
    currentChain,
    currentAccount,
    currentTokenBalances,
    itaniTokens,
    formattedTokenBalances,
    addAccount,
    switchChain,
    refreshBalance,
    refreshAllTokenBalances,
    deployContract,
    mintTokens,
    forceTransfer,
    createCustomToken,
  };
});

// Fonction utilitaire pour formater les balances
function formatBalance(balance: string, decimals: number): string {
  try {
    const balanceNum = parseFloat(balance);
    if (balanceNum === 0) return "0";

    // Convertir de wei vers unités lisibles
    const readable = balanceNum / Math.pow(10, decimals);
    return readable.toLocaleString('en-US', {
      maximumFractionDigits: decimals > 6 ? 6 : decimals,
      minimumFractionDigits: 0
    });
  } catch {
    return balance;
  }
}
// Fonctionnalités DEX
async function addLiquidity(tokenA: string, tokenB: string, amountA: string, amountB: string) {
  if (currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('DEX', 'add_liquidity', [tokenA, tokenB, amountA, amountB]);
  }
  throw new Error("DEX disponible uniquement sur iTani Network Chain");
}

async function swapTokens(fromToken: string, toToken: string, amountIn: string) {
  if (currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('DEX', 'swap', [fromToken, toToken, amountIn]);
  }
  throw new Error("DEX disponible uniquement sur iTani Network Chain");
}

async function getSwapPrice(fromToken: string, toToken: string, amountIn: string) {
  if (currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('DEX', 'get_price', [fromToken, toToken, amountIn]);
  }
  throw new Error("DEX disponible uniquement sur iTani Network Chain");
}

// Fonctionnalités Governance
async function createProposal(title: string, description: string, proposalType: string, targetContract: string, callData: string) {
  if (currentAccount.value && currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('Governance', 'propose', [
      currentAccount.value.address,
      proposalType,
      description,
      targetContract,
      callData
    ]);
  }
  throw new Error("Gouvernance disponible uniquement sur iTani Network Chain");
}

async function voteOnProposal(proposalId: string, support: number, votes: string) {
  if (currentAccount.value && currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('Governance', 'vote', [
      currentAccount.value.address,
      proposalId,
      support.toString(),
      votes
    ]);
  }
  throw new Error("Gouvernance disponible uniquement sur iTani Network Chain");
}

async function delegateVotes(delegateAddress: string, amount: string) {
  if (currentAccount.value && currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('Governance', 'delegate_votes', [
      currentAccount.value.address,
      delegateAddress,
      amount
    ]);
  }
  throw new Error("Gouvernance disponible uniquement sur iTani Network Chain");
}

// Fonctionnalités Oracle
async function getTokenPrice(tokenSymbol: string) {
  if (currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('Oracle', 'get_price', [tokenSymbol]);
  }
  throw new Error("Oracles disponibles uniquement sur iTani Network Chain");
}

async function checkStability(tokenSymbol: string, currentPrice: string) {
  if (currentChain.value === 'itani') {
    const itaniChain = chains.itani as ItaniChain;
    return await itaniChain.callContract('Oracle', 'validate_stability', [tokenSymbol, currentPrice]);
  }
  throw new Error("Oracles disponibles uniquement sur iTani Network Chain");
}
