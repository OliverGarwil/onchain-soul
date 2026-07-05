'use client';

import { ritualChain } from '@/lib/ritual';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function ChainGuard() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === ritualChain.id) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-5 py-3 rounded-2xl border border-amber-400/30 bg-[#1a3d32] text-sm shadow-lg flex items-center gap-4">
      <span className="text-amber-100/90">Switch to Ritual testnet (Chain ID 1979)</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: ritualChain.id })}
        className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium disabled:opacity-60"
      >
        {isPending ? 'Switching…' : 'Switch network'}
      </button>
    </div>
  );
}
