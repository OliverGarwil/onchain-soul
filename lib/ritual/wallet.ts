import { createPublicClient, http, parseEther, type WalletClient } from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';
import { RITUAL_WALLET_ABI, SYSTEM_CONTRACTS } from '@/lib/ritual/constants';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

const MIN_DEPOSIT = parseEther('0.005');
const LOCK_BLOCKS = BigInt(5000);

/** Ensure RitualWallet has enough balance for async precompiles */
export async function ensureRitualWalletDeposit(
  walletClient: WalletClient,
  userAddress: `0x${string}`
): Promise<void> {
  const balance = await publicClient.readContract({
    address: SYSTEM_CONTRACTS.RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  if (balance >= MIN_DEPOSIT) return;

  const hash = await walletClient.writeContract({
    address: SYSTEM_CONTRACTS.RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: 'deposit',
    args: [LOCK_BLOCKS],
    value: MIN_DEPOSIT,
    chain: ritualChain,
    account: userAddress,
  });

  await publicClient.waitForTransactionReceipt({ hash });
}
