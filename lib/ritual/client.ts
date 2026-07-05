import type { Config } from 'wagmi';
import { getWalletClient } from 'wagmi/actions';
import type { WalletClient } from 'viem';
import { ritualChain } from '@/lib/ritual';

/** Resolve a signer from wagmi (more reliable than useWalletClient hook alone) */
export async function resolveWalletClient(
  config: Config,
  account: `0x${string}`
): Promise<WalletClient> {
  const client = await getWalletClient(config, {
    account,
    chainId: ritualChain.id,
  });

  if (!client) {
    throw new Error('Wallet not ready. Open your wallet extension and try again.');
  }

  return client;
}
