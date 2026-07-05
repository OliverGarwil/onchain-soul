'use client';

import { DimensionScores } from '@/lib/soulFormula';

interface DimensionRadarProps {
  dimensions: DimensionScores;
}

const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  frequency: 'Frequency',
  gasIntensity: 'Gas Intensity',
  diversity: 'Diversity',
  risk: 'Risk Profile',
  regularity: 'Timing Regularity',
  value: 'Value Movement',
  timeOfDay: 'Time Focus',
};

export function DimensionRadar({ dimensions }: DimensionRadarProps) {
  const entries = Object.entries(dimensions) as [keyof DimensionScores, number][];

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key} className="group">
          <div className="flex items-baseline justify-between mb-1.5 text-sm">
            <div className="text-white/70 tracking-[-0.1px]">{DIMENSION_LABELS[key]}</div>
            <div className="font-mono text-xs text-white/50 tabular-nums">{value}</div>
          </div>
          <div className="h-px w-full bg-white/10 relative">
            <div
              className="absolute top-0 left-0 h-px bg-white/70 transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
