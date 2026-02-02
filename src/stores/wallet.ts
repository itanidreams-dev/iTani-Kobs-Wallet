// src/stores/wallet.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import CryptoJS from 'crypto-js';
import { ItaniChain, itaniConfig } from '@/chains/itani';
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
}

export interface WalletUser {
  email: string;
  passwordHash: string;
}

export const useWalletStore = defineStore('wallet', () => {
  const accounts = ref<WalletAccount[]>([]);
  const users = ref<WalletUser[]>([]);
  const currentChain = ref('itani');
  const isAuthenticated = ref(false);
  const currentUserEmail = ref<string | null>(null);

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

  const chains = {
    itani: new ItaniChain(itaniConfig),
    ethereum: new EthereumChain(ethereumConfig),
    solana: new SolanaChain(solanaConfig),
    bitcoin: new BitcoinChain(bitcoinConfig),
    cosmos: new CosmosChain(cosmosConfig),
    avalanche: new AvalancheChain(avalancheConfig),
  };

  const userAccounts = computed(() => {
    if (!currentUserEmail.value) return [];
    return accounts.value.filter((acc) => acc.ownerEmail === currentUserEmail.value);
  });

  const currentAccount = computed(() => {
    if (!currentUserEmail.value) return undefined;
    return userAccounts.value.find(acc => acc.chain === currentChain.value);
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
  }

  async function refreshBalance() {
    if (currentAccount.value) {
      const chainInstance = chains[currentChain.value as keyof typeof chains];
      currentAccount.value.balance = await chainInstance.getBalance(currentAccount.value.address);
    }
  }

  return {
    accounts,
    users,
    currentChain,
    currentAccount,
    currentUserEmail,
    userAccounts,
    isAuthenticated,
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
    refreshBalance,
  };
});