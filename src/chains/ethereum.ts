// src/chains/ethereum.ts
import { ethers } from 'ethers';

export interface EthereumConfig {
  rpcUrl: string;
  chainId: number;
}

export const ethereumConfig: EthereumConfig = {
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with actual
  chainId: 1,
};

export class EthereumChain {
  private provider: ethers.Provider;

  constructor(private config: EthereumConfig) {
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