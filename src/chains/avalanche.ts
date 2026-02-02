// src/chains/avalanche.ts
import { ethers } from 'ethers';

export interface AvalancheConfig {
  rpcUrl: string;
  chainId: number;
}

export const avalancheConfig: AvalancheConfig = {
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  chainId: 43114,
};

export class AvalancheChain {
  private provider: ethers.Provider;

  constructor(private config: AvalancheConfig) {
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(signer: ethers.Signer, to: string, amount: string): Promise<string> {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });
    return tx.hash;
  }
}