// src/chains/bitcoin.ts
import * as bitcoin from 'bitcoinjs-lib';

export interface BitcoinConfig {
  network: bitcoin.Network;
}

export const bitcoinConfig: BitcoinConfig = {
  network: bitcoin.networks.bitcoin,
};

export class BitcoinChain {
  constructor(private config: BitcoinConfig) {}

  async getBalance(address: string): Promise<string> {
    // In real implementation, use a Bitcoin API like BlockCypher or Electrum
    // For demo, return mock balance
    return '0.001'; // Mock
  }

  // Add send transaction method
}