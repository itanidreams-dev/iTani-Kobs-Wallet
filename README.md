# iTani Kobs Wallet

A multi-chain crypto wallet dApp for iTani Network and other blockchains like Ethereum, Binance Smart Chain, Solana, Bitcoin, Cosmos, and Avalanche.

## Architecture

```
iTani-Wallet/
├── src/
│   ├── chains/          # Classes pour chaque blockchain
│   │   ├── itani.ts     # Intégration iTani Network
│   │   ├── ethereum.ts  # Ethereum via ethers.js
│   │   ├── solana.ts    # Solana via @solana/web3.js
│   │   ├── bitcoin.ts   # Bitcoin via bitcoinjs-lib
│   │   ├── cosmos.ts    # Cosmos via @cosmjs
│   │   └── avalanche.ts # Avalanche via ethers.js
│   ├── stores/
│   │   └── wallet.ts    # Store Pinia pour comptes
│   ├── views/           # Pages principales
│   │   ├── DashboardView.vue
│   │   ├── AccountsView.vue
│   │   ├── SendView.vue
│   │   ├── SwapView.vue
│   │   └── HistoryView.vue
│   ├── components/
│   │   ├── Navbar.vue       # Navigation avec sélecteur de chaîne
│   │   └── BalanceTooltip.vue # Infobulle flottante balance
│   └── router/index.ts  # Configuration des routes
```

## Features

- Multi-chain support: iTani, Ethereum, Solana, Bitcoin, Cosmos, Avalanche
- Account management
- Send and receive crypto
- Swap functionality
- Transaction history
- Secure key management
- Floating balance tooltip (draggable, blurable)

## Setup

1. Clone the repo
2. `npm install`
3. Pour la version démo (testnet) : `npm run build-demo`
4. Pour la version réelle (mainnet) : `npm run build-mainnet`
5. Ou pour le développement : `npm run dev` (utilise automatiquement le testnet)

## Versions

- **Version Démo (Testnet)** : Connectée au testnet local ou distant d'iTani Network Chain. Utilisée pour les tests et la démonstration.
- **Version Réelle (Mainnet)** : Connectée au mainnet d'iTani Network Chain. Utilisée pour les transactions réelles.

La configuration se bascule automatiquement via la variable `NODE_ENV`.

## Architecture

- Vue 3 + TypeScript
- Pinia for state management
- Vite for build
- Chain-specific libraries for integration

## Integration with iTani Network

This wallet integrates with the iTani Network Chain via its APIs for blockchain interactions.

For production, configure RPC URLs and API endpoints in `src/chains/`.

## Security

- Private keys are stored locally (in demo; use encryption in production)
- No server-side storage of sensitive data

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
