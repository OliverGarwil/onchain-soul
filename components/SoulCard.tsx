'use client';

import { motion } from 'framer-motion';
import { Calendar, Hash, Zap } from 'lucide-react';

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
  imageUrl: string; // placeholder or generated
}

interface SoulCardProps {
  soul: SoulData;
  variant?: 'default' | 'share';
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

export function SoulCard({ soul, variant = 'default', onShare }: SoulCardProps) {
  const accent = archetypeColors[soul.archetype];

  return (
    <div className="group relative w-full max-w-[420px] rounded-3xl overflow-hidden border border-white/10 bg-[#05241F]">
      {/* Top accent bar */}
      <div className="h-[3px]" style={{ backgroundColor: accent }} />

      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[2px] text-white/40 mb-1">RITUAL CHAIN • 1979</div>
          <div className="text-4xl font-semibold tracking-[-1.5px] leading-none">{soul.archetype}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">SOUL ID</div>
          <div className="font-mono text-sm text-white/70">#{soul.id.slice(0, 8)}</div>
        </div>
      </div>

      {/* Image / Visual */}
      <div className="relative aspect-[4/3] bg-zinc-900 flex items-center justify-center overflow-hidden">
        {soul.imageUrl ? (
          <img
            src={soul.imageUrl}
            alt={soul.archetype}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-center">
            <div className="text-6xl opacity-30 mb-2">◉</div>
            <div className="text-xs tracking-[1px] text-white/30">GENERATIVE PFP</div>
          </div>
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      </div>

      {/* Biography */}
      <div className="px-8 py-8 text-[15px] leading-[1.45] text-white/80 tracking-[-0.1px]">
        {soul.biography}
      </div>

      {/* Traits */}
      <div className="px-8 pb-8">
        <div className="flex flex-wrap gap-2">
          {soul.traits.map((trait, index) => (
            <div
              key={index}
              className="px-4 py-1 rounded-full text-xs border border-white/10 bg-white/[0.03] text-white/70"
            >
              {trait}
            </div>
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          {soul.mintedAt}
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5" />
          {soul.txHash.slice(0, 10)}…
        </div>
      </div>

      {/* Share button (only on share variant or hover) */}
      {(variant === 'share' || onShare) && (
        <button
          onClick={onShare}
          className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur text-xs tracking-[0.5px] border border-white/20 hover:bg-white hover:text-black transition-all active:scale-[0.985]"
        >
          <Zap className="w-3.5 h-3.5" /> SHARE
        </button>
      )}
    </div>
  );
}
