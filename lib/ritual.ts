import { defineChain } from 'viem';

/** Ritual testnet chain config */
export const ritualChain = defineChain({
  id: 1979,
  name: 'Ritual',
  nativeCurrency: { name: 'RITUAL', symbol: 'RITUAL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ritualfoundation.org'],
      webSocket: ['wss://rpc.ritualfoundation.org/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ritual Explorer',
      url: 'https://explorer.ritualfoundation.org',
    },
  },
});

export const RITUAL_RPC = 'https://rpc.ritualfoundation.org';
export const RITUAL_EXPLORER_API = 'https://explorer.ritualfoundation.org/api/v2';
