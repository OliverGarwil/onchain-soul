/**
 * Onchain Soul — 7-Dimensional Soul Archetype Formula
 * 
 * This module computes a user's "chain soul" based on 7 observable behavioral dimensions
 * extracted from their on-chain transaction history on Ritual Chain.
 */

export type SoulArchetype =
  | 'The Silent Architect'
  | 'The Eternal DeGen'
  | 'The Patient Oracle'
  | 'The Phantom Collector'
  | 'The Ritual Weaver'
  | 'The Sovereign Agent';

export type TimeSlot = 'NIGHT_OWL' | 'EARLY_BIRD' | 'WORK_HOURS' | 'EVENING_RITUAL';

export interface TimeProfile {
  slotDistribution: Record<TimeSlot, number>; // percentage 0-100
  regularity: number; // 0-100
}

export interface DimensionScores {
  frequency: number;
  gasIntensity: number;
  diversity: number;
  risk: number;
  regularity: number;
  value: number;
  timeOfDay: number; // composite of time slot preference
}

export interface SoulResult {
  archetype: SoulArchetype;
  scores: Record<SoulArchetype, number>;
  dimensions: DimensionScores;
  explanation: string;
}

// --- Dimension Scoring Functions ---

export function frequencyScore(txCount: number, days: number): number {
  const txPerDay = txCount / Math.max(days, 1);
  return Math.min(100, Math.max(0, (txPerDay - 0.1) / 9.9 * 100));
}

export function gasIntensityScore(avgGasPriceGwei: number, totalGasUsed: number): number {
  const gasPriceScore = Math.min(100, (avgGasPriceGwei / 20) * 100);
  const volumeScore = Math.min(100, (totalGasUsed / 5_000_000) * 100);
  return gasPriceScore * 0.7 + volumeScore * 0.3;
}

export function diversityScore(uniqueContracts: number, totalTx: number): number {
  const ratio = uniqueContracts / Math.max(totalTx, 1);
  const absoluteBonus = Math.min(50, uniqueContracts * 2);
  return Math.min(100, ratio * 60 + absoluteBonus);
}

export function riskScore(newContractRatio: number, failureRatio: number): number {
  return Math.min(100, newContractRatio * 70 + failureRatio * 30);
}

export function regularityScore(stdDevSeconds: number): number {
  return Math.max(0, Math.min(100, 100 - (stdDevSeconds / (24 * 3600)) * 100));
}

export function valueScore(avgValue: number): number {
  return Math.min(100, Math.max(0, (Math.log10(avgValue + 0.01) + 2) / 4 * 100));
}

export function timeOfDayComposite(timeProfile: TimeProfile): number {
  const { NIGHT_OWL, EARLY_BIRD, WORK_HOURS, EVENING_RITUAL } = timeProfile.slotDistribution;
  // Higher score if behavior is concentrated in one slot (more "ritualistic" or "agentic")
  const maxSlot = Math.max(NIGHT_OWL, EARLY_BIRD, WORK_HOURS, EVENING_RITUAL);
  return Math.min(100, maxSlot * 1.2);
}

// --- Main Formula ---

const ARCHETYPES: SoulArchetype[] = [
  'The Silent Architect',
  'The Eternal DeGen',
  'The Patient Oracle',
  'The Phantom Collector',
  'The Ritual Weaver',
  'The Sovereign Agent',
];

export function computeSoul(
  params: {
    txCount: number;
    days: number;
    avgGasPriceGwei: number;
    totalGasUsed: number;
    uniqueContracts: number;
    newContractRatio: number;
    failureRatio: number;
    stdDevSeconds: number;
    avgValue: number;
    timeProfile: TimeProfile;
  }
): SoulResult {
  const {
    txCount,
    days,
    avgGasPriceGwei,
    totalGasUsed,
    uniqueContracts,
    newContractRatio,
    failureRatio,
    stdDevSeconds,
    avgValue,
    timeProfile,
  } = params;

  const f = frequencyScore(txCount, days);
  const g = gasIntensityScore(avgGasPriceGwei, totalGasUsed);
  const d = diversityScore(uniqueContracts, txCount);
  const r = riskScore(newContractRatio, failureRatio);
  const t = regularityScore(stdDevSeconds);
  const v = valueScore(avgValue);
  const tod = timeOfDayComposite(timeProfile);

  const { NIGHT_OWL: night, EARLY_BIRD: early, WORK_HOURS: work, EVENING_RITUAL: evening } =
    timeProfile.slotDistribution;

  const scores: Record<SoulArchetype, number> = {
    'The Eternal DeGen':
      0.22 * f + 0.20 * g + 0.15 * r + 0.12 * d + 0.10 * night + 0.08 * (100 - t) + 0.08 * v + 0.05 * (100 - work),

    'The Silent Architect':
      0.10 * f + 0.12 * g + 0.18 * d + 0.22 * r + 0.15 * work + 0.12 * t + 0.06 * v + 0.05 * (100 - night),

    'The Patient Oracle':
      0.06 * f + 0.10 * g + 0.15 * d + 0.28 * r + 0.18 * early + 0.15 * t + 0.05 * v + 0.03 * (100 - evening),

    'The Phantom Collector':
      0.15 * f + 0.10 * g + 0.32 * d + 0.18 * r + 0.10 * (100 - t) + 0.08 * v + 0.04 * night + 0.03 * evening,

    'The Ritual Weaver':
      0.18 * f + 0.12 * g + 0.15 * d + 0.15 * r + 0.18 * evening + 0.12 * t + 0.06 * v + 0.04 * work,

    'The Sovereign Agent':
      0.12 * f + 0.18 * g + 0.10 * d + 0.15 * r + 0.20 * t + 0.15 * (100 - Math.max(night, early, work, evening)) + 0.06 * v + 0.04 * (100 - r),
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const archetype = sorted[0][0] as SoulArchetype;

  const dimensions: DimensionScores = {
    frequency: Math.round(f),
    gasIntensity: Math.round(g),
    diversity: Math.round(d),
    risk: Math.round(r),
    regularity: Math.round(t),
    value: Math.round(v),
    timeOfDay: Math.round(tod),
  };

  const explanation = generateExplanation(archetype, dimensions, timeProfile);

  return {
    archetype,
    scores: Object.fromEntries(sorted.map(([k, v]) => [k, Math.round(v)])) as Record<SoulArchetype, number>,
    dimensions,
    explanation,
  };
}

function generateExplanation(
  archetype: SoulArchetype,
  dim: DimensionScores,
  time: TimeProfile
): string {
  const night = Math.round(time.slotDistribution.NIGHT_OWL);
  const early = Math.round(time.slotDistribution.EARLY_BIRD);
  const work = Math.round(time.slotDistribution.WORK_HOURS);
  const evening = Math.round(time.slotDistribution.EVENING_RITUAL);

  if (archetype === 'The Eternal DeGen') {
    return `You are most active between 00:00-06:00 (${night}% of your transactions). Your high gas usage and low timing regularity mark you as a true edge chaser.`;
  }
  if (archetype === 'The Silent Architect') {
    return `You operate with precision during work hours (${work}% of activity) and maintain extremely regular patterns. Every move is intentional.`;
  }
  if (archetype === 'The Patient Oracle') {
    return `Your transactions cluster in the early morning (${early}%). You wait, watch, and strike with high conviction.`;
  }
  if (archetype === 'The Phantom Collector') {
    return `You explore widely across contracts (${dim.diversity} diversity). Time means little to you — you collect the overlooked.`;
  }
  if (archetype === 'The Ritual Weaver') {
    return `Your ritual peaks in the evening hours (${evening}%). You treat the chain as ceremony, not chaos.`;
  }
  // Sovereign Agent
  return `Your activity is distributed across all hours with machine-like regularity. You are not just a user — you are an operator.`;
}
