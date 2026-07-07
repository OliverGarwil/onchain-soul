'use client';

import type { TimeProfile } from '@/lib/soulFormula';

const SLOT_LABELS: Record<keyof TimeProfile['slotDistribution'], string> = {
  NIGHT_OWL: 'Night Owl (00–06)',
  EARLY_BIRD: 'Early Bird (06–10)',
  WORK_HOURS: 'Work Hours (10–18)',
  EVENING_RITUAL: 'Evening (18–24)',
};

interface TimeDistributionViewProps {
  profile: TimeProfile;
}

/** Read-only view of on-chain time distribution (not user-editable) */
export function TimeDistributionView({ profile }: TimeDistributionViewProps) {
  const entries = Object.entries(profile.slotDistribution) as [
    keyof TimeProfile['slotDistribution'],
    number,
  ][];

  return (
    <div className="space-y-4">
      {entries.map(([slot, pct]) => (
        <div key={slot}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white/60">{SLOT_LABELS[slot]}</span>
            <span className="font-mono text-white/50 tabular-nums">{pct}%</span>
          </div>
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/55 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-white/40 pt-2 leading-relaxed">
        Time distribution is derived from your on-chain transaction timestamps and cannot be edited.
      </p>
    </div>
  );
}
