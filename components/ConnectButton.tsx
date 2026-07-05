'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

type Variant = 'nav' | 'hero' | 'discover';

interface ConnectButtonProps {
  variant?: Variant;
  className?: string;
}

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ConnectButton({ variant = 'nav', className = '' }: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const base =
    variant === 'nav'
      ? 'px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all active:scale-[0.985]'
      : variant === 'hero'
        ? 'px-9 h-14 rounded-2xl bg-white text-black text-lg font-medium hover:bg-white/90 transition-all'
        : 'px-10 h-12 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all';

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className={`${base} ${className}`}
        title="Click to disconnect wallet"
      >
        {truncate(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => connect({ connector: connectors[0] })}
      className={`${base} disabled:opacity-60 ${className}`}
    >
      {isPending ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
