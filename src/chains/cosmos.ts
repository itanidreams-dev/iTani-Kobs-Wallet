// src/chains/cosmos.ts
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';

export interface CosmosConfig {
  rpcUrl: string;
  chainId: string;
}

export const cosmosConfig: CosmosConfig = {
  rpcUrl: 'https://rpc.cosmos.network',
  chainId: 'cosmoshub-4',
};

export class CosmosChain {
  private client: StargateClient | null = null;

  constructor(private config: CosmosConfig) {}

  async connect() {
    this.client = await StargateClient.connect(this.config.rpcUrl);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.client) await this.connect();
    const balance = await this.client!.getAllBalances(address);
    const atomBalance = balance.find(b => b.denom === 'uatom');
    return atomBalance ? (parseInt(atomBalance.amount) / 1000000).toString() : '0';
  }
}