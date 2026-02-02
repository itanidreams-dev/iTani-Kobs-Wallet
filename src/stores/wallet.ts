// src/stores/wallet.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import CryptoJS from 'crypto-js';
import type { ItaniToken } from '@/chains/itani';
import { ItaniChain, getItaniConfig, ITANI_TOKENS } from '@/chains/itani';
import { EthereumChain, ethereumConfig } from '@/chains/ethereum';
import { SolanaChain, solanaConfig } from '@/chains/solana';
import { BitcoinChain, bitcoinConfig } from '@/chains/bitcoin';
import { CosmosChain, cosmosConfig } from '@/chains/cosmos';
import { AvalancheChain, avalancheConfig } from '@/chains/avalanche';

export interface WalletAccount {
  address: string;
  encryptedPrivateKey: string;
  ownerEmail: string;
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

export interface WalletUser {
  email: string;
  passwordHash: string;
}

export const useWalletStore = defineStore('wallet', () => {
  const accounts = ref<WalletAccount[]>([]);
  const users = ref<WalletUser[]>([]);
  const currentChain = ref('itani');
  const currentTokenBalances = ref<TokenBalance[]>([]);
  const isAuthenticated = ref(false);
  const currentUserEmail = ref<string | null>(null);
  const isMainnet = ref(false); // false = testnet (demo), true = mainnet (reel)

  const STORAGE_KEY = 'itani_wallet_state';

  function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  function hashPassword(password: string) {
    return CryptoJS.SHA256(password).toString();
  }

  function getUserByEmail(email: string) {
    const normalized = normalizeEmail(email);
    return users.value.find((user) => user.email === normalized);
  }

  function getUserKey(email: string) {
    const user = getUserByEmail(email);
    return user?.passwordHash ?? '';
  }

  function encryptPrivateKey(privateKey: string, email: string) {
    const key = getUserKey(email);
    return CryptoJS.AES.encrypt(privateKey, key).toString();
  }

  function decryptPrivateKey(encryptedPrivateKey: string, email: string) {
    const key = getUserKey(email);
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        accounts?: WalletAccount[];
        users?: WalletUser[];
        currentChain?: string;
        isAuthenticated?: boolean;
        currentUserEmail?: string | null;
      };

      const loadedUsers = parsed.users ?? [];
      users.value = loadedUsers.map((user) => {
        if ('password' in user) {
          return {
            email: normalizeEmail((user as { password: string; email: string }).email),
            passwordHash: hashPassword((user as { password: string }).password),
          };
        }
        return {
          email: normalizeEmail(user.email),
          passwordHash: user.passwordHash,
        };
      });

      const loadedAccounts = parsed.accounts ?? [];
      accounts.value = loadedAccounts.map((account) => {
        if ('privateKey' in account && !(account as WalletAccount).encryptedPrivateKey) {
          const legacy = account as { privateKey: string; ownerEmail?: string } & WalletAccount;
          return {
            address: legacy.address,
            encryptedPrivateKey: legacy.privateKey,
            ownerEmail: legacy.ownerEmail ?? 'legacy@local',
            chain: legacy.chain,
            balance: legacy.balance,
          };
        }
        return account as WalletAccount;
      });

      currentChain.value = parsed.currentChain ?? 'itani';
      currentUserEmail.value = parsed.currentUserEmail ?? null;

      if (parsed.isAuthenticated && currentUserEmail.value) {
        const userExists = !!getUserByEmail(currentUserEmail.value);
        isAuthenticated.value = userExists;
        if (!userExists) {
          currentUserEmail.value = null;
        }
      } else {
        isAuthenticated.value = false;
        currentUserEmail.value = null;
      }
    } catch {
      // ignore corrupted storage
    }
  }

  function saveToStorage() {
    const payload = {
      accounts: accounts.value,
      users: users.value,
      currentChain: currentChain.value,
      isAuthenticated: isAuthenticated.value,
      currentUserEmail: currentUserEmail.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  const userAccounts = computed(() => {
    if (!currentUserEmail.value) return [];
    return accounts.value.filter((acc) => acc.ownerEmail === currentUserEmail.value);
  });

  const currentAccount = computed(() => {
    if (!currentUserEmail.value) return undefined;
    return userAccounts.value.find(acc => acc.chain === currentChain.value);
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

  function addUser(user: WalletUser) {
    const existing = getUserByEmail(user.email);
    if (!existing) {
      users.value.push(user);
    }
  }

  function hasUser(email: string) {
    return !!getUserByEmail(email);
  }

  function validateUser(email: string, password: string) {
    const user = getUserByEmail(email);
    if (!user) return false;
    return user.passwordHash === hashPassword(password);
  }

  function setAuthenticated(value: boolean, email?: string) {
    if (value && email) {
      isAuthenticated.value = true;
      currentUserEmail.value = normalizeEmail(email);
      return;
    }
    isAuthenticated.value = false;
    currentUserEmail.value = null;
  }

  function logout() {
    isAuthenticated.value = false;
    currentUserEmail.value = null;
  }

  loadFromStorage();

  watch([accounts, users, currentChain, isAuthenticated], saveToStorage, { deep: true });

  function switchChain(chain: string) {
    currentChain.value = chain;
    // Recharger les balances quand on change de chaîne
    if (chain === 'itani') {
      refreshAllTokenBalances();
    }
  }

  function toggleNetwork() {
    isMainnet.value = !isMainnet.value;
    // Recréer la chaîne iTani avec la nouvelle config
    chains.itani = new ItaniChain(getItaniConfig(isMainnet.value));
    // Recharger les balances
    if (currentChain.value === 'itani') {
      refreshAllTokenBalances();
    }
  }

  const chains = {
    itani: new ItaniChain(getItaniConfig(isMainnet.value)),
    ethereum: new EthereumChain(ethereumConfig),
    solana: new SolanaChain(solanaConfig),
    bitcoin: new BitcoinChain(bitcoinConfig),
    cosmos: new CosmosChain(cosmosConfig),
    avalanche: new AvalancheChain(avalancheConfig),
  };

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
    users,
    currentChain,
    currentAccount,
    currentTokenBalances,
    itaniTokens,
    formattedTokenBalances,
    currentUserEmail,
    userAccounts,
    isAuthenticated,
    isMainnet,
    addAccount,
    addUser,
    hasUser,
    validateUser,
    setAuthenticated,
    logout,
    encryptPrivateKey,
    decryptPrivateKey,
    hashPassword,
    normalizeEmail,
    switchChain,
    toggleNetwork,
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
