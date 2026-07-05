import { createPublicClient, http, parseEther, type Hash, type WalletClient } from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

/** Ritual rejects EOA transfers with calldata — use a plain value transfer instead */
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const;
export const READING_FEE_WEI = parseEther('0.00001');

/** Opening fee: small RITUAL transfer (user pays gas + fee, visible on explorer) */
export async function paySoulReadingFee(
  walletClient: WalletClient,
  userAddress: `0x${string}`
): Promise<Hash> {
  const hash = await walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: BURN_ADDRESS,
    value: READING_FEE_WEI,
  });

  await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
  return hash;
}
