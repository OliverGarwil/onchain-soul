import { parseEther, type Hash, type WalletClient } from 'viem';
import { ritualChain } from '@/lib/ritual';
import { BURN_ADDRESS } from '@/lib/ritual/readingFee';
import type { SoulArchetype } from '@/lib/soulFormula';

export interface SoulAnchorPayload {
  archetype: SoulArchetype;
  address: string;
  dimensions: Record<string, number>;
  mintedAt: string;
}

const ANCHOR_FEE_WEI = parseEther('0.00001');

/** Anchor soul on-chain via plain transfer (Ritual disallows calldata on EOA targets) */
export async function anchorSoulOnChain(
  walletClient: WalletClient,
  userAddress: `0x${string}`,
  _payload: SoulAnchorPayload
): Promise<Hash> {
  return walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: BURN_ADDRESS,
    value: ANCHOR_FEE_WEI,
  });
}
