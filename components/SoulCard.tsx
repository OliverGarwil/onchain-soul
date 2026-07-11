'use client';

import { useState } from 'react';
import { Calendar, Hash, Share2 } from 'lucide-react';

export type SoulArchetype =
  | 'The Silent Architect'
  | 'The Eternal DeGen'
  | 'The Patient Oracle'
  | 'The Phantom Collector'
  | 'The Ritual Weaver'
  | 'The Sovereign Agent';

export interface SoulData {
  id: string;
  archetype: SoulArchetype;
  biography: string;
  traits: string[];
  mintedAt: string;
  txHash: string;
  imageUrl: string;
}

interface SoulCardProps {
  soul: SoulData;
  variant?: 'default' | 'share';
  /** Reveal 页右侧已有传记，卡片内可隐藏避免重复 */
  hideBiography?: boolean;
  onShare?: () => void;
}

const archetypeColors: Record<SoulArchetype, string> = {
  'The Silent Architect': '#3b82f6',
  'The Eternal DeGen': '#ef4444',
  'The Patient Oracle': '#8b5cf6',
  'The Phantom Collector': '#14b8a6',
  'The Ritual Weaver': '#f59e0b',
  'The Sovereign Agent': '#ec4899',
};

export function SoulCard({ soul, variant = 'default', hideBiography = false, onShare }: SoulCardProps) {
  const accent = archetypeColors[soul.archetype];
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#05241F] shadow-[0_24px_80px_rgb(0_0_0/0.35)] transition-transform duration-300 hover:-translate-y-0.5">
      <div className="h-[3px]" style={{ backgroundColor: accent }} />

      <div className="flex items-start justify-between px-6 pt-7 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
        <div className="min-w-0 pr-4">
          <div className="mb-1 text-[10px] tracking-[2px] text-white/40">RITUAL CHAIN • 1979</div>
          <div className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-1px] sm:text-4xl sm:tracking-[-1.5px]">
            {soul.archetype}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-white/40">SOUL ID</div>
          <div className="font-mono text-sm text-white/70">#{soul.id.slice(2, 10)}</div>
        </div>
      </div>

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#041915]">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] to-transparent" />
        )}
        {soul.imageUrl ? (
          <img
            src={soul.imageUrl}
            alt={soul.archetype}
            className={`h-full w-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="text-center">
            <div className="mb-2 text-6xl opacity-30">◉</div>
            <div className="text-xs tracking-[1px] text-white/30">GENERATIVE PFP</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />
        <div
          className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: accent }}
        />
      </div>

      {!hideBiography && (
        <div className="px-6 py-7 text-[15px] leading-[1.45] tracking-[-0.1px] text-white/80 sm:px-8 sm:py-8">
          {soul.biography}
        </div>
      )}

      <div className={`px-6 sm:px-8 ${hideBiography ? 'pt-6' : 'pb-2'}`}>
        <div className="flex flex-wrap gap-2">
          {soul.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-white/70"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 px-6 py-4 font-mono text-xs text-white/50 sm:px-8 sm:py-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          {soul.mintedAt}
        </div>
        <a
          href={`https://explorer.ritualfoundation.org/tx/${soul.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-white/80"
        >
          <Hash className="h-3.5 w-3.5" />
          {soul.txHash.slice(0, 10)}…
        </a>
      </div>

      {variant === 'share' && onShare && (
        <button
          type="button"
          onClick={onShare}
          className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-6 py-4 text-xs tracking-[1px] text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white sm:px-8"
        >
          <Share2 className="h-4 w-4" /> SHARE YOUR SOUL
        </button>
      )}
    </div>
  );
}
