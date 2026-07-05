import { createPublicClient, http, type Hash, type WalletClient } from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

/** Opening fee: self-transfer with READ calldata (user pays gas, visible on explorer) */
export async function paySoulReadingFee(
  walletClient: WalletClient,
  userAddress: `0x${string}`
): Promise<Hash> {
  const hash = await walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: userAddress,
    value: BigInt(0),
    data: '0x52454144' as `0x${string}`,
  });

  await publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
  return hash;
}
