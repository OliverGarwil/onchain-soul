'use client';

import { motion } from 'framer-motion';
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
    <div className="space-y-5">
      {entries.map(([key, value], index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35 }}
          className="group"
        >
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <div className="tracking-[-0.1px] text-white/70">{DIMENSION_LABELS[key]}</div>
            <div className="font-mono text-xs tabular-nums text-white/50">{value}</div>
          </div>
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-white/75"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
