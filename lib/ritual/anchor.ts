import { keccak256, stringToHex, type Hash, type WalletClient } from 'viem';
import { ritualChain } from '@/lib/ritual';
import type { SoulArchetype } from '@/lib/soulFormula';

export interface SoulAnchorPayload {
  archetype: SoulArchetype;
  address: string;
  dimensions: Record<string, number>;
  mintedAt: string;
}

/** Anchor soul data on-chain (self-transfer + calldata, visible in explorer) */
export async function anchorSoulOnChain(
  walletClient: WalletClient,
  userAddress: `0x${string}`,
  payload: SoulAnchorPayload
): Promise<Hash> {
  const soulHash = keccak256(
    stringToHex(
      JSON.stringify({
        v: 1,
        app: 'OnchainSoul',
        ...payload,
      })
    )
  );

  // 0x534f554c = "SOUL" magic bytes + soulHash
  const data = (`0x534f554c${soulHash.slice(2)}` as `0x${string}`);

  const hash = await walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: userAddress,
    value: BigInt(0),
    data,
  });

  return hash;
}
