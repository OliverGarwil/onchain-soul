'use client';

import { ritualChain } from '@/lib/ritual';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function ChainGuard() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === ritualChain.id) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-amber-400/30 bg-[#1a3d32] px-4 py-3 text-sm shadow-lg sm:gap-4 sm:px-5">
        <span className="text-amber-100/90">Switch to Ritual testnet (Chain ID 1979)</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchChain({ chainId: ritualChain.id })}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black disabled:opacity-60"
        >
          {isPending ? 'Switching…' : 'Switch network'}
        </button>
      </div>
    </div>
  );
}
