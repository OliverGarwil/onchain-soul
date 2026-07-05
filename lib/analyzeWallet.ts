import { createPublicClient, formatEther, http, type Hash } from 'viem';
import { ritualChain, RITUAL_EXPLORER_API, RITUAL_RPC } from './ritual';
import { computeSoul, type SoulResult, type TimeProfile } from './soulFormula';

export interface ChainTx {
  hash: Hash;
  to: string | null;
  value: bigint;
  gasPrice: bigint;
  gasUsed: bigint;
  status: 'success' | 'failed';
  timestamp: number; // unix seconds
}

export interface WalletAnalysis {
  address: string;
  txs: ChainTx[];
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
  source: 'explorer' | 'onchain';
}

interface ExplorerTx {
  hash: string;
  to: { hash: string } | null;
  value: string;
  gas_price: string;
  gas_used: string;
  status: string;
  timestamp: string;
}

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

/** Fetch outgoing transactions for an address from the explorer API */
async function fetchExplorerTxs(address: string): Promise<ChainTx[]> {
  try {
    const url = `${RITUAL_EXPLORER_API}/addresses/${address}/transactions?filter=from&limit=50`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = (await res.json()) as { items?: ExplorerTx[] };
    if (!data.items?.length) return [];

    return data.items.map((tx) => ({
      hash: tx.hash as Hash,
      to: tx.to?.hash ?? null,
      value: BigInt(tx.value || '0'),
      gasPrice: BigInt(tx.gas_price || '0'),
      gasUsed: BigInt(tx.gas_used || '0'),
      status: tx.status === 'ok' ? 'success' : 'failed',
      timestamp: new Date(tx.timestamp).getTime() / 1000,
    }));
  } catch {
    return [];
  }
}

/** Build 24h time-slot distribution from transaction timestamps */
export function buildTimeProfile(txs: ChainTx[]): TimeProfile {
  const slots = { NIGHT_OWL: 0, EARLY_BIRD: 0, WORK_HOURS: 0, EVENING_RITUAL: 0 };

  if (txs.length === 0) {
    return {
      slotDistribution: { NIGHT_OWL: 25, EARLY_BIRD: 25, WORK_HOURS: 25, EVENING_RITUAL: 25 },
      regularity: 30,
    };
  }

  for (const tx of txs) {
    const hour = new Date(tx.timestamp * 1000).getUTCHours();
    if (hour >= 0 && hour < 6) slots.NIGHT_OWL++;
    else if (hour >= 6 && hour < 10) slots.EARLY_BIRD++;
    else if (hour >= 10 && hour < 18) slots.WORK_HOURS++;
    else slots.EVENING_RITUAL++;
  }

  const total = txs.length;
  const slotDistribution = {
    NIGHT_OWL: Math.round((slots.NIGHT_OWL / total) * 100),
    EARLY_BIRD: Math.round((slots.EARLY_BIRD / total) * 100),
    WORK_HOURS: Math.round((slots.WORK_HOURS / total) * 100),
    EVENING_RITUAL: Math.round((slots.EVENING_RITUAL / total) * 100),
  };

  // Regularity: standard deviation of inter-transaction intervals
  const sorted = [...txs].sort((a, b) => a.timestamp - b.timestamp);
  let stdDevSeconds = 24 * 3600;
  if (sorted.length >= 3) {
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i].timestamp - sorted[i - 1].timestamp);
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((s, i) => s + (i - mean) ** 2, 0) / intervals.length;
    stdDevSeconds = Math.sqrt(variance);
  }

  const regularity = Math.max(0, Math.min(100, 100 - (stdDevSeconds / (24 * 3600)) * 100));

  return { slotDistribution, regularity };
}

function computeMetrics(txs: ChainTx[], address: string): Omit<WalletAnalysis, 'address' | 'source'> {
  const txCount = txs.length;
  const timestamps = txs.map((t) => t.timestamp).filter(Boolean);
  const days =
    timestamps.length >= 2
      ? Math.max(1, Math.ceil((Math.max(...timestamps) - Math.min(...timestamps)) / 86400))
      : 7;

  const avgGasPriceGwei =
    txCount > 0 ? txs.reduce((s, t) => s + Number(t.gasPrice), 0) / txCount / 1e9 : 2;

  const totalGasUsed = txCount > 0 ? txs.reduce((s, t) => s + Number(t.gasUsed), 0) : 0;

  const uniqueContracts = new Set(txs.map((t) => t.to).filter(Boolean)).size;
  const failed = txs.filter((t) => t.status === 'failed').length;
  const failureRatio = txCount > 0 ? failed / txCount : 0;

  // Heuristic: when unique contracts > 3, treat some interactions as new-contract exploration
  const newContractRatio = txCount > 0 ? Math.min(0.8, uniqueContracts / Math.max(txCount, 1) + 0.1) : 0.2;

  const valueTxs = txs.filter((t) => t.value > BigInt(0));
  const avgValue =
    valueTxs.length > 0
      ? valueTxs.reduce((s, t) => s + Number(formatEther(t.value)), 0) / valueTxs.length
      : 0.01;

  const timeProfile = buildTimeProfile(txs);

  let stdDevSeconds = 24 * 3600;
  if (timestamps.length >= 3) {
    const sorted = [...timestamps].sort((a, b) => a - b);
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) intervals.push(sorted[i] - sorted[i - 1]);
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    stdDevSeconds = Math.sqrt(intervals.reduce((s, i) => s + (i - mean) ** 2, 0) / intervals.length);
  }

  return {
    txs,
    txCount: Math.max(txCount, 1),
    days,
    avgGasPriceGwei,
    totalGasUsed,
    uniqueContracts: Math.max(uniqueContracts, 1),
    newContractRatio,
    failureRatio,
    stdDevSeconds,
    avgValue,
    timeProfile,
  };
}

/** Deterministic fallback when on-chain data is sparse (stable per address) */
function seedMetricsFromAddress(address: string, nonce: number, balance: bigint): WalletAnalysis {
  const seed = parseInt(address.slice(2, 10), 16);
  void balance;

  const timeProfile: TimeProfile = {
    slotDistribution: {
      NIGHT_OWL: (seed % 40) + 10,
      EARLY_BIRD: ((seed >> 4) % 30) + 5,
      WORK_HOURS: ((seed >> 8) % 35) + 15,
      EVENING_RITUAL: 0,
    },
    regularity: 30 + (seed % 50),
  };
  const sum = Object.values(timeProfile.slotDistribution).reduce((a, b) => a + b, 0);
  timeProfile.slotDistribution.EVENING_RITUAL = Math.max(5, 100 - sum);

  const metrics = {
    txs: [] as ChainTx[],
    txCount: Math.max(nonce, 1),
    days: 14 + (seed % 20),
    avgGasPriceGwei: 2 + (seed % 15),
    totalGasUsed: 200_000 + (seed % 3_000_000),
    uniqueContracts: Math.max(1, Math.min(nonce, 12)),
    newContractRatio: 0.15 + (seed % 40) / 100,
    failureRatio: (seed % 15) / 100,
    stdDevSeconds: 4000 + (seed % 80_000),
    avgValue: 0.05 + (seed % 80) / 100,
    timeProfile,
  };

  return { address, source: 'onchain', ...metrics };
}

/** Analyze wallet on-chain behavior */
export async function analyzeWallet(address: `0x${string}`): Promise<WalletAnalysis> {
  let txs = await fetchExplorerTxs(address);

  if (txs.length === 0) {
    const [nonce, balance] = await Promise.all([
      publicClient.getTransactionCount({ address }),
      publicClient.getBalance({ address }),
    ]);

    if (nonce === 0) {
      return seedMetricsFromAddress(address, 0, balance);
    }

    // Nonzero nonce but no explorer data — estimate activity from nonce
    return seedMetricsFromAddress(address, nonce, balance);
  }

  return {
    address,
    source: 'explorer',
    ...computeMetrics(txs, address),
  };
}

/** Compute soul result from wallet analysis */
export function soulFromAnalysis(analysis: WalletAnalysis): SoulResult {
  const { timeProfile } = analysis;
  return computeSoul({
    txCount: analysis.txCount,
    days: analysis.days,
    avgGasPriceGwei: analysis.avgGasPriceGwei,
    totalGasUsed: analysis.totalGasUsed,
    uniqueContracts: analysis.uniqueContracts,
    newContractRatio: analysis.newContractRatio,
    failureRatio: analysis.failureRatio,
    stdDevSeconds: analysis.stdDevSeconds,
    avgValue: analysis.avgValue,
    timeProfile: {
      ...timeProfile,
      regularity: timeProfile.regularity,
    },
  });
}
