// src/chains/itani.ts
import axios from 'axios';

export interface ItaniConfig {
  rpcUrl: string;
  apiUrl: string;
  chainId: string;
}

export const itaniConfig: ItaniConfig = {
  rpcUrl: 'http://localhost:8080', // Adjust for production
  apiUrl: 'http://localhost:3000', // Internal API
  chainId: 'itani-testnet',
};

export class ItaniChain {
  constructor(private config: ItaniConfig) {}

  async getBalance(address: string): Promise<string> {
    const response = await axios.get(`${this.config.apiUrl}/balance/${address}`);
    return response.data.balance;
  }

  async sendTransaction(tx: any): Promise<string> {
    const response = await axios.post(`${this.config.rpcUrl}/submit_tx`, tx);
    return response.data.txHash;
  }

  // Add more methods for DEX, staking, etc.
}