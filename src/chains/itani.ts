// src/chains/itani.ts
import axios from 'axios';

export interface ItaniConfig {
  rpcUrl: string;
  apiUrl: string;
  chainId: string;
}

// Configuration pour le testnet (démo)
export const itaniTestnetConfig: ItaniConfig = {
  rpcUrl: 'http://localhost:8545', // RPC blockchain iTani testnet
  apiUrl: 'http://localhost:3000', // Internal API testnet
  chainId: 'itani-testnet',
};

// Configuration pour le mainnet (réel)
export const itaniMainnetConfig: ItaniConfig = {
  rpcUrl: 'https://rpc.itani.network', // RPC blockchain iTani mainnet (à configurer)
  apiUrl: 'https://api.itani.network', // Internal API mainnet (à configurer)
  chainId: 'itani-mainnet',
};

// Configuration actuelle (basculable dynamiquement)
export const getItaniConfig = (isMainnet: boolean) => isMainnet ? itaniMainnetConfig : itaniTestnetConfig;

// Définition des tokens iTani natifs (priorité absolue)
export interface ItaniToken {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  address: string;
  description: string;
  isNative: boolean;
}

export const ITANI_TOKENS: ItaniToken[] = [
  {
    name: "iTani Token",
    symbol: "ITANI",
    decimals: 18,
    totalSupply: "1000000000000000000000000000", // 1B ITANI
    address: "iTaTOKENITANI0000000000000000000000",
    description: "Token principal de la iTani Network Chain",
    isNative: true
  },
  {
    name: "HIS Token",
    symbol: "HIS",
    decimals: 18,
    totalSupply: "500000000000000000000000000", // 500M HIS
    address: "iTaTOKENHIS000000000000000000000000",
    description: "Stablecoin 1:1 EUR (50% HTG + 50% DOP)",
    isNative: true
  },
  {
    name: "LOOT Token",
    symbol: "LOOT",
    decimals: 18,
    totalSupply: "100000000000000000000000000", // 100M LOOT
    address: "iTaTOKENLOOT0000000000000000000000",
    description: "Token de récompense - staking, mining",
    isNative: true
  },
  {
    name: "Art Rings Token",
    symbol: "ART_RINGS",
    decimals: 18,
    totalSupply: "10000000000000000000000000", // 10M ART_RINGS
    address: "iTaTOKENARTRINGS00000000000000000",
    description: "Token NFT - création et échange d'art",
    isNative: true
  }
];

export class ItaniChain {
  constructor(private config: ItaniConfig) {}

  // Méthodes de base
  async getBalance(address: string, tokenSymbol?: string): Promise<string> {
    if (tokenSymbol) {
      // Balance d'un token spécifique
      const response = await axios.post(this.config.rpcUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "get_token_balance",
        params: { address, token: tokenSymbol }
      });
      return response.data.result?.balance || "0";
    } else {
      // Balance native (ITANI)
      const response = await axios.post(this.config.rpcUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"]
      });
      return response.data.result || "0";
    }
  }

  async getAllBalances(address: string): Promise<{[symbol: string]: string}> {
    const balances: {[symbol: string]: string} = {};

    // Récupérer les balances de tous les tokens iTani
    for (const token of ITANI_TOKENS) {
      try {
        balances[token.symbol] = await this.getBalance(address, token.symbol);
      } catch (error) {
        balances[token.symbol] = "0";
      }
    }

    return balances;
  }

  async sendTransaction(tx: any): Promise<string> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "eth_sendTransaction",
      params: [tx]
    });
    return response.data.result;
  }

  // Méthodes spéciales pour le contrôle total (réservées au wallet officiel)
  async deployContract(name: string, wasmBase64: string): Promise<any> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "kobs_deploy_contract",
      params: {
        name,
        wasm: wasmBase64,
        deployer: "iTaKOBSWALLET0000000000000000000000"
      }
    });
    return response.data.result;
  }

  async mintTokens(tokenName: string, symbol: string, totalSupply: string, description?: string): Promise<any> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "kobs_mint_tokens",
      params: {
        contract: "KobsTokenFactory",
        token_name: tokenName,
        symbol,
        decimals: 18,
        total_supply: totalSupply,
        description: description || "",
        minter: "iTaKOBSWALLET0000000000000000000000"
      }
    });
    return response.data.result;
  }

  async forceTransfer(from: string, to: string, token: string, amount: string): Promise<any> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "kobs_force_transfer",
      params: {
        from,
        to,
        token,
        amount,
        executor: "iTaKOBSWALLET0000000000000000000000"
      }
    });
    return response.data.result;
  }

  // Méthodes pour les tokens personnalisés
  async createCustomToken(name: string, symbol: string, totalSupply: string, creator: string): Promise<any> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "token_factory_create",
      params: {
        name,
        symbol,
        kind: "ITANI20",
        decimals: 18,
        total_supply: totalSupply,
        creator,
        require_btc: false
      }
    });
    return response.data.result;
  }

  // Récupérer la liste de tous les tokens disponibles
  getAvailableTokens(): ItaniToken[] {
    return ITANI_TOKENS;
  }

  // Vérifier si un token est natif iTani
  isNativeToken(symbol: string): boolean {
    return ITANI_TOKENS.some(token => token.symbol === symbol && token.isNative);
  }

  // Appeler un contrat déployé (DEX, Governance, Oracle)
  async callContract(contractName: string, method: string, params: any[] = []): Promise<any> {
    const response = await axios.post(this.config.rpcUrl, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "kobs_call_contract",
      params: {
        contract: contractName,
        method,
        args: params
      }
    });
    return response.data.result;
  }
}