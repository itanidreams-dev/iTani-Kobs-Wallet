// src/chains/solana.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface SolanaConfig {
  rpcUrl: string;
}

export const solanaConfig: SolanaConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
};

export class SolanaChain {
  private connection: Connection;

  constructor(private config: SolanaConfig) {
    this.connection = new Connection(this.config.rpcUrl);
  }

  async getBalance(address: string): Promise<string> {
    const publicKey = new PublicKey(address);
    const balance = await this.connection.getBalance(publicKey);
    return (balance / LAMPORTS_PER_SOL).toString();
  }

  // Add send transaction method
}