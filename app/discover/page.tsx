'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { SoulCard, type SoulData, type SoulArchetype } from '@/components/SoulCard';
import { DimensionRadar } from '@/components/DimensionRadar';
import { TimeDistributionView } from '@/components/TimeDistributionView';
import { ConnectButton } from '@/components/ConnectButton';
import { analyzeWallet, soulFromAnalysis, type WalletAnalysis } from '@/lib/analyzeWallet';
import type { SoulResult } from '@/lib/soulFormula';
import { generateBiographyOnChain } from '@/lib/ritual/llm';
import { anchorSoulOnChain } from '@/lib/ritual/anchor';
import type { Hash } from 'viem';

const MOCK_BIOGRAPHIES: Record<SoulArchetype, string> = {
  'The Silent Architect':
    'You move with intention. Your transactions are sparse but precise — each one a carefully placed stone in a larger structure only you can see.',
  'The Eternal DeGen':
    'You chase the edge. High gas, high risk, high frequency. The chain knows you by your willingness to lose everything for the next alpha.',
  'The Patient Oracle':
    'You watch. You wait. Your calls are rare but heavy with meaning. When you act, the market often follows.',
  'The Phantom Collector':
    'You collect the invisible. Contracts, signatures, forgotten tokens — your history is a museum of things others overlooked.',
  'The Ritual Weaver':
    'You treat the chain as ceremony. Every interaction is part of a larger pattern you are still learning to read.',
  'The Sovereign Agent':
    'You are not just a user — you are an operator. Autonomous, deliberate, and increasingly non-human in your precision.',
};

const MOCK_TRAITS: Record<SoulArchetype, string[]> = {
  'The Silent Architect': ['Precise', 'Low noise', 'Long-term', 'Strategic'],
  'The Eternal DeGen': ['High frequency', 'Risk-tolerant', 'Gas warrior', 'Alpha chaser'],
  'The Patient Oracle': ['Low frequency', 'High conviction', 'Contrarian', 'Time-rich'],
  'The Phantom Collector': ['Obscure', 'Curious', 'Archival', 'Pattern seeker'],
  'The Ritual Weaver': ['Ceremonial', 'Patterned', 'Reflective', 'Mythic'],
  'The Sovereign Agent': ['Autonomous', 'Precise', 'Non-human', 'Operator'],
};

export default function DiscoverSoul() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState<'idle' | 'analyzing' | 'generating' | 'reveal'>('idle');
  const [soul, setSoul] = useState<SoulData | null>(null);
  const [progress, setProgress] = useState(0);
  const [formulaResult, setFormulaResult] = useState<SoulResult | null>(null);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [timeProfile, setTimeProfile] = useState<WalletAnalysis['timeProfile'] | null>(null);
  const [llmTxHash, setLlmTxHash] = useState<Hash | null>(null);
  const [onChainBio, setOnChainBio] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!address || !walletClient) return;

    setError(null);
    setStatusNote(null);
    setLlmTxHash(null);
    setOnChainBio(false);
    setStep('analyzing');
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(95, p + Math.random() * 12 + 4));
    }, 300);

    try {
      const walletAnalysis = await analyzeWallet(address);
      clearInterval(progressTimer);
      setProgress(100);
      setAnalysis(walletAnalysis);
      setTimeProfile(walletAnalysis.timeProfile);

      setStep('generating');
      setProgress(20);

      const result = soulFromAnalysis(walletAnalysis);
      let biography = MOCK_BIOGRAPHIES[result.archetype as SoulArchetype];
      let txHash = walletAnalysis.txs[0]?.hash ?? walletAnalysis.address;

      setProgress(40);
      setStatusNote('Invoking Ritual LLM precompile (0x0802)…');

      try {
        const llm = await generateBiographyOnChain(walletClient, address, walletAnalysis, result);
        biography = llm.biography;
        txHash = llm.txHash;
        setLlmTxHash(llm.txHash);
        setOnChainBio(true);
        setStatusNote('On-chain LLM biography generated');
      } catch (llmErr) {
        console.warn('LLM precompile failed, trying API fallback:', llmErr);
        try {
          const res = await fetch('/api/biography', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysis: walletAnalysis, result }),
          });
          if (res.ok) {
            const data = (await res.json()) as { biography?: string };
            if (data.biography) {
              biography = data.biography;
              setStatusNote('Biography generated via API fallback');
            } else {
              setStatusNote('LLM unavailable — using template biography from on-chain analysis');
            }
          } else {
            setStatusNote('LLM unavailable — using template biography from on-chain analysis');
          }
        } catch {
          setStatusNote('LLM unavailable — using template biography from on-chain analysis');
        }
      }

      setProgress(100);
      const soulData: SoulData = {
        id: walletAnalysis.address,
        archetype: result.archetype as SoulArchetype,
        biography,
        traits: MOCK_TRAITS[result.archetype as SoulArchetype],
        mintedAt: new Date().toISOString().split('T')[0],
        txHash: txHash.startsWith('0x') ? txHash : (`0x${txHash}` as Hash),
        imageUrl: `https://picsum.photos/seed/${walletAnalysis.address.slice(2, 10)}/800/600`,
      };

      setSoul(soulData);
      setFormulaResult(result);
      setStep('reveal');
    } catch {
      clearInterval(progressTimer);
      setError('Failed to read on-chain data. Connect to Ritual testnet (1979) and ensure you have test RITUAL.');
      setStep('idle');
    }
  };

  const handleMint = async () => {
    if (!address || !walletClient || !soul || !formulaResult) return;

    setMinting(true);
    setError(null);

    try {
      const hash = await anchorSoulOnChain(walletClient, address, {
        archetype: soul.archetype,
        address: soul.id,
        dimensions: formulaResult.dimensions as unknown as Record<string, number>,
        mintedAt: soul.mintedAt,
      });

      setSoul({ ...soul, txHash: hash });
      setStatusNote(`Soul anchored on-chain: ${hash.slice(0, 10)}…`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'On-chain anchor failed');
    } finally {
      setMinting(false);
    }
  };

  const reset = () => {
    setStep('idle');
    setSoul(null);
    setFormulaResult(null);
    setAnalysis(null);
    setTimeProfile(null);
    setLlmTxHash(null);
    setOnChainBio(false);
    setProgress(0);
    setError(null);
    setStatusNote(null);
  };

  return (
    <div className="min-h-screen bg-[#0B2E26] text-[#F4F4EF] flex flex-col">
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
          <img src="/logo.png" alt="Onchain Soul" className="w-7 h-7" />
          <span>Back to home</span>
        </Link>
        <ConnectButton variant="nav" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 pb-24">
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-lg"
            >
              <div className="text-xs tracking-[3px] text-white/40 mb-4">STEP 01 — THE AWAKENING</div>
              <h1 className="text-6xl tracking-[-2.2px] leading-none mb-6">
                Let the chain
                <br />
                read you.
              </h1>
              <p className="text-xl text-white/60 mb-10">
                We analyze your Ritual on-chain history and derive your soul from real behavior.
              </p>

              {!isConnected ? (
                <div className="space-y-4">
                  <ConnectButton variant="hero" className="inline-flex items-center gap-3" />
                  <div className="text-xs text-white/40">Connect a Ritual testnet wallet first (Chain ID 1979)</div>
                </div>
              ) : !walletClient ? (
                <p className="text-sm text-white/50">Initializing wallet client…</p>
              ) : (
                <button
                  onClick={runAnalysis}
                  className="px-12 h-14 rounded-2xl bg-white text-black text-lg font-medium inline-flex items-center gap-3 active:bg-white/90"
                >
                  Begin soul reading <Sparkles className="w-5 h-5" />
                </button>
              )}

              {error && <p className="mt-6 text-sm text-red-300/90">{error}</p>}
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" className="text-center max-w-md">
              <div className="text-xs tracking-[3px] text-white/40 mb-4">STEP 02 — READING THE LEDGER</div>
              <div className="text-5xl tracking-[-1.5px] mb-8">Scanning your on-chain history...</div>
              <div className="h-px bg-white/10 mb-6" />
              <div className="font-mono text-sm text-white/60 mb-3">{Math.floor(progress)}% COMPLETE</div>
              <div className="h-px w-full bg-white/10 overflow-hidden">
                <div className="h-px bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-6 text-xs text-white/40">Reading blocks • Decoding calls • Mapping interactions</div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="generating" className="text-center max-w-md">
              <div className="text-xs tracking-[3px] text-white/40 mb-4">STEP 03 — INVOKING THE PRECOMPILES</div>
              <div className="text-5xl tracking-[-1.5px] mb-8">The TEE is writing your story...</div>
              <div className="flex justify-center mb-8">
                <Loader2 className="w-8 h-8 animate-spin text-white/70" />
              </div>
              <div className="font-mono text-sm text-white/60 mb-3">{Math.floor(progress)}%</div>
              <div className="h-px w-full bg-white/10 overflow-hidden mb-4">
                <div className="h-px bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
              {statusNote && <p className="text-xs text-white/45">{statusNote}</p>}
            </motion.div>
          )}

          {step === 'reveal' && soul && formulaResult && timeProfile && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[1080px] px-6"
            >
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-1 rounded-full bg-white/5 text-[10px] tracking-[2px] text-white/50 mb-4">
                  RITUAL CHAIN • 1979
                </div>
                <div className="text-6xl tracking-[-2px] mb-3">This is your soul.</div>
                <div className="text-xl text-white/60">Derived from your on-chain behavior.</div>
                {analysis && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] tracking-[1px]">
                    <span className="px-3 py-1 rounded-full border border-white/10 text-white/50">
                      DATA: {analysis.source === 'explorer' ? 'EXPLORER API' : 'ON-CHAIN RPC'}
                    </span>
                    {onChainBio && (
                      <span className="px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-200/80">
                        BIO: LLM 0x0802 ON-CHAIN
                      </span>
                    )}
                    {llmTxHash && (
                      <a
                        href={`https://explorer.ritualfoundation.org/tx/${llmTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full border border-white/10 text-white/50 hover:text-white"
                      >
                        VIEW LLM TX
                      </a>
                    )}
                  </div>
                )}
                {statusNote && <p className="mt-3 text-sm text-white/50">{statusNote}</p>}
              </div>

              <div className="grid lg:grid-cols-[460px,1fr] gap-x-12 gap-y-10 items-start">
                <div>
                  <SoulCard soul={soul} variant="share" onShare={() => alert('Share cards coming soon')} />
                </div>

                <div className="space-y-10 pt-2">
                  <div>
                    <div className="uppercase text-xs tracking-[2.5px] text-white/40 mb-3">THE CHAIN SPEAKS</div>
                    <p className="text-[17px] leading-[1.55] text-white/85 max-w-[46ch]">{soul.biography}</p>
                    <p className="mt-4 text-sm text-white/45 max-w-[46ch]">{formulaResult.explanation}</p>
                  </div>

                  <details className="group border border-white/10 rounded-2xl px-7 py-6 open:bg-white/[0.02]">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-sm tracking-[1px] text-white/60">
                      <span>7-DIMENSIONAL BREAKDOWN</span>
                      <span className="group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="pt-6">
                      <DimensionRadar dimensions={formulaResult.dimensions} />
                    </div>
                  </details>

                  <details className="group border border-white/10 rounded-2xl px-7 py-6 open:bg-white/[0.02]">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-sm tracking-[1px] text-white/60">
                      <span>TIME DISTRIBUTION</span>
                      <span className="group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="pt-6">
                      <TimeDistributionView profile={timeProfile} />
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={reset}
                  className="w-full sm:w-auto px-10 h-12 rounded-2xl border border-white/20 hover:bg-white/5 text-sm tracking-[0.8px] transition-all"
                >
                  START ANOTHER READING
                </button>
                <button
                  onClick={handleMint}
                  disabled={minting}
                  className="w-full sm:w-auto px-14 h-12 rounded-2xl bg-white text-black font-medium text-sm tracking-[0.8px] active:bg-white/90 transition-all disabled:opacity-60"
                >
                  {minting ? 'ANCHORING ON CHAIN…' : 'ANCHOR SOUL ON RITUAL'}
                </button>
              </div>
              {error && <p className="mt-6 text-center text-sm text-red-300/90">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
