import type { WalletAnalysis } from '@/lib/analyzeWallet';
import type { SoulResult } from '@/lib/soulFormula';

/** Build the soul biography LLM prompt */
export function buildBiographyPrompt(analysis: WalletAnalysis, result: SoulResult): string {
  const { slotDistribution } = analysis.timeProfile;
  return `You are Onchain Soul on Ritual Chain. Write a vivid 2-sentence chain biography in English for this wallet personality.

Archetype: ${result.archetype}
Transactions: ${analysis.txCount} over ${analysis.days} days
Unique contracts: ${analysis.uniqueContracts}
Time slots (%) — Night: ${slotDistribution.NIGHT_OWL}, Early: ${slotDistribution.EARLY_BIRD}, Work: ${slotDistribution.WORK_HOURS}, Evening: ${slotDistribution.EVENING_RITUAL}
Dimensions (0-100): frequency ${result.dimensions.frequency}, gas ${result.dimensions.gasIntensity}, diversity ${result.dimensions.diversity}, risk ${result.dimensions.risk}

Rules: poetic but precise, no bullet points, max 45 words, second person "you".`;
}
