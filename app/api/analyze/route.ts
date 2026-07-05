import { NextResponse } from 'next/server';
import { analyzeWallet, type WalletAnalysis } from '@/lib/analyzeWallet';
import { isAddress } from 'viem';

export type WalletAnalysisDto = Omit<WalletAnalysis, 'txs'> & {
  txs: {
    hash: string;
    to: string | null;
    value: string;
    gasPrice: string;
    gasUsed: string;
    status: 'success' | 'failed';
    timestamp: number;
  }[];
};

function toDto(analysis: WalletAnalysis): WalletAnalysisDto {
  return {
    ...analysis,
    txs: analysis.txs.map((tx) => ({
      hash: tx.hash,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice.toString(),
      gasUsed: tx.gasUsed.toString(),
      status: tx.status,
      timestamp: tx.timestamp,
    })),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { address?: string };
    const address = body.address?.trim();

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const analysis = await analyzeWallet(address);
    return NextResponse.json({ analysis: toDto(analysis) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze wallet';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
