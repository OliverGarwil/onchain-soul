'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useAccount, useChainId, useConfig } from 'wagmi';
import { SoulCard, type SoulData, type SoulArchetype } from '@/components/SoulCard';
import { DimensionRadar } from '@/components/DimensionRadar';
import { TimeDistributionView } from '@/components/TimeDistributionView';
import { ConnectButton } from '@/components/ConnectButton';
import { SiteDisclaimer } from '@/components/SiteDisclaimer';
import { PageShell } from '@/components/PageShell';
import { ProgressBar } from '@/components/ProgressBar';
import { StepIndicator } from '@/components/StepIndicator';
import { ShareCardModal } from '@/components/ShareCardModal';
import { soulFromAnalysis, type WalletAnalysis } from '@/lib/analyzeWallet';
import type { SoulResult } from '@/lib/soulFormula';
import { resolveWalletClient } from '@/lib/ritual/client';
import { paySoulReadingFee } from '@/lib/ritual/readingFee';
import { generateBiographyOnChain } from '@/lib/ritual/llm';
import { anchorSoulOnChain } from '@/lib/ritual/anchor';
import { ritualChain } from '@/lib/ritual';
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

type FlowStep = 'idle' | 'opening' | 'analyzing' | 'generating' | 'reveal';

function stepIndex(step: FlowStep): number {
  switch (step) {
    case 'idle':
      return 0;
    case 'opening':
      return 1;
    case 'analyzing':
      return 2;
    case 'generating':
      return 3;
    case 'reveal':
      return 3;
    default:
      return 0;
  }
}

function LoadingStep({
  stepLabel,
  title,
  progress,
  statusNote,
  active,
}: {
  stepLabel: string;
  title: string;
  progress: number;
  statusNote: string | null;
  active?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-md text-center"
    >
      <div className="mb-4 text-xs tracking-[3px] text-white/40">{stepLabel}</div>
      <div className="mb-8 text-3xl leading-tight tracking-[-1px] sm:text-5xl sm:tracking-[-1.5px]">{title}</div>
      <div className="mb-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
      <div className="mb-3 font-mono text-sm text-white/60">{Math.floor(progress)}%</div>
      <ProgressBar value={progress} active={active} className="mb-4" />
      {statusNote && <p className="text-xs leading-relaxed text-white/45">{statusNote}</p>}
    </motion.div>
  );
}

export default function DiscoverSoul() {
  const config = useConfig();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<FlowStep>('idle');
  const [soul, setSoul] = useState<SoulData | null>(null);
  const [progress, setProgress] = useState(0);
  const [formulaResult, setFormulaResult] = useState<SoulResult | null>(null);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [timeProfile, setTimeProfile] = useState<WalletAnalysis['timeProfile'] | null>(null);
  const [readingTxHash, setReadingTxHash] = useState<Hash | null>(null);
  const [llmTxHash, setLlmTxHash] = useState<Hash | null>(null);
  const [onChainBio, setOnChainBio] = useState(false);
  const [minting, setMinting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const showStepIndicator = step !== 'reveal';
  const currentStep = useMemo(() => stepIndex(step), [step]);

  const runAnalysis = async () => {
    if (!address) return;

    if (chainId !== ritualChain.id) {
      setError('Switch to Ritual testnet (Chain ID 1979) before starting.');
      return;
    }

    setStarting(true);
    setError(null);
    setStatusNote(null);
    setReadingTxHash(null);
    setLlmTxHash(null);
    setOnChainBio(false);
    setStep('opening');
    setProgress(10);

    try {
      const walletClient = await resolveWalletClient(config, address);
      setStatusNote('Confirm the soul reading fee in your wallet (0.00001 RITUAL + gas)…');
      setProgress(25);

      const readingHash = await paySoulReadingFee(walletClient, address);
      setReadingTxHash(readingHash);
      setStep('analyzing');
      setProgress(35);
      setStatusNote('Reading fee confirmed. Scanning your on-chain history…');

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(95, p + Math.random() * 12 + 4));
      }, 300);

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!analyzeRes.ok) {
        const detail = (await analyzeRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(detail.error || 'Failed to analyze on-chain history');
      }

      const { analysis: walletAnalysis } = (await analyzeRes.json()) as { analysis: WalletAnalysis };
      clearInterval(progressTimer);
      setProgress(100);
      setAnalysis(walletAnalysis);
      setTimeProfile(walletAnalysis.timeProfile);
      setStatusNote(null);

      setStep('generating');
      setProgress(20);

      const result = soulFromAnalysis(walletAnalysis);
      let biography = MOCK_BIOGRAPHIES[result.archetype as SoulArchetype];
      let txHash = readingHash;

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
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to start soul reading. Connect to Ritual testnet (1979) and ensure you have test RITUAL.'
      );
      setStep('idle');
    } finally {
      setStarting(false);
    }
  };

  const handleMint = async () => {
    if (!address || !soul || !formulaResult) return;

    setMinting(true);
    setError(null);

    try {
      const walletClient = await resolveWalletClient(config, address);
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
    setReadingTxHash(null);
    setLlmTxHash(null);
    setOnChainBio(false);
    setProgress(0);
    setStarting(false);
    setShareOpen(false);
    setError(null);
    setStatusNote(null);
  };

  return (
    <PageShell
      header={
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 sm:hidden" />
            <img src="/logo.png" alt="Onchain Soul" className="hidden h-7 w-7 sm:block" />
            <span>Back to home</span>
          </Link>
          <ConnectButton variant="nav" />
        </div>
      }
      className="flex flex-col"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 pb-28 sm:px-6 sm:py-12 sm:pb-24">
        {showStepIndicator && <StepIndicator current={currentStep} />}

        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg text-center"
            >
              <div className="mb-4 text-xs tracking-[3px] text-white/40">STEP 01 — THE AWAKENING</div>
              <h1 className="mb-6 text-5xl leading-none tracking-[-2px] sm:text-6xl sm:tracking-[-2.2px]">
                Let the chain
                <br />
                read you.
              </h1>
              <p className="mb-8 text-lg text-white/60 sm:text-xl">
                We analyze your Ritual on-chain history and derive your soul from real behavior.
              </p>

              <div className="mb-8 px-2">
                <SiteDisclaimer compact />
              </div>

              {!isConnected ? (
                <div className="space-y-4">
                  <ConnectButton variant="hero" className="inline-flex items-center gap-3" />
                  <div className="text-xs text-white/40">Connect a Ritual testnet wallet first (Chain ID 1979)</div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={starting}
                  className="inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-12 text-lg font-medium text-black transition-all active:bg-white/90 disabled:opacity-60"
                >
                  {starting ? 'Opening wallet…' : 'Begin soul reading'} <Sparkles className="h-5 w-5" />
                </button>
              )}

              {isConnected && chainId !== ritualChain.id && (
                <p className="mt-4 text-sm text-amber-200/90">Switch to Ritual testnet (1979) to continue.</p>
              )}

              {error && <p className="mt-6 text-sm text-red-300/90">{error}</p>}
            </motion.div>
          )}

          {step === 'opening' && (
            <LoadingStep
              stepLabel="STEP 02 — OPEN THE RITUAL"
              title="Confirm your reading fee on-chain…"
              progress={progress}
              statusNote={statusNote}
              active
            />
          )}

          {step === 'analyzing' && (
            <LoadingStep
              stepLabel="STEP 03 — READING THE LEDGER"
              title="Scanning your on-chain history…"
              progress={progress}
              statusNote={statusNote ?? 'Reading blocks • Decoding calls • Mapping interactions'}
              active
            />
          )}

          {step === 'generating' && (
            <LoadingStep
              stepLabel="STEP 04 — INVOKING THE PRECOMPILES"
              title="The TEE is writing your story…"
              progress={progress}
              statusNote={statusNote}
              active
            />
          )}

          {step === 'reveal' && soul && formulaResult && timeProfile && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[1080px]"
            >
              <div className="mb-10 text-center sm:mb-12">
                <div className="mb-4 inline-block rounded-full bg-white/5 px-4 py-1 text-[10px] tracking-[2px] text-white/50">
                  RITUAL CHAIN • 1979
                </div>
                <div className="mb-3 text-4xl tracking-[-1.5px] sm:text-6xl sm:tracking-[-2px]">This is your soul.</div>
                <div className="text-lg text-white/60 sm:text-xl">Derived from your on-chain behavior.</div>

                {analysis && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2 text-[10px] tracking-[1px]">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                      DATA: {analysis.source === 'explorer' ? 'EXPLORER API' : 'ON-CHAIN RPC'}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/50">
                      {analysis.txCount} TX • {analysis.days}D
                    </span>
                    {readingTxHash && (
                      <a
                        href={`https://explorer.ritualfoundation.org/tx/${readingTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/50 transition-colors hover:text-white"
                      >
                        READING TX <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {onChainBio && (
                      <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-emerald-200/80">
                        BIO: LLM 0x0802 ON-CHAIN
                      </span>
                    )}
                    {llmTxHash && (
                      <a
                        href={`https://explorer.ritualfoundation.org/tx/${llmTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-white/50 transition-colors hover:text-white"
                      >
                        LLM TX <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
                {statusNote && <p className="mt-3 text-sm text-white/50">{statusNote}</p>}
              </div>

              <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-x-12">
                <div className="mx-auto w-full lg:mx-0">
                  <SoulCard
                    soul={soul}
                    variant="share"
                    hideBiography
                    onShare={() => setShareOpen(true)}
                  />
                </div>

                <div className="space-y-8 pt-0 lg:space-y-10 lg:pt-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-7 sm:px-7">
                    <div className="mb-3 text-xs tracking-[2.5px] text-white/40">THE CHAIN SPEAKS</div>
                    <p className="max-w-[46ch] text-[17px] leading-[1.55] text-white/85">{soul.biography}</p>
                    <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-white/45">{formulaResult.explanation}</p>
                  </div>

                  <details className="group rounded-2xl border border-white/10 px-6 py-6 open:bg-white/[0.02] sm:px-7">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm tracking-[1px] text-white/60">
                      <span>7-DIMENSIONAL BREAKDOWN</span>
                      <span className="transition-transform group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="pt-6">
                      <DimensionRadar dimensions={formulaResult.dimensions} />
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-white/10 px-6 py-6 open:bg-white/[0.02] sm:px-7">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm tracking-[1px] text-white/60">
                      <span>TIME DISTRIBUTION</span>
                      <span className="transition-transform group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="pt-6">
                      <TimeDistributionView profile={timeProfile} />
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:mt-16 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="h-12 w-full rounded-2xl border border-white/20 text-sm tracking-[0.8px] transition-all hover:bg-white/5 sm:w-auto sm:px-10"
                >
                  START ANOTHER READING
                </button>
                <button
                  type="button"
                  onClick={handleMint}
                  disabled={minting}
                  className="h-12 w-full rounded-2xl bg-white text-sm font-medium tracking-[0.8px] text-black transition-all active:bg-white/90 disabled:opacity-60 sm:w-auto sm:px-14"
                >
                  {minting ? 'ANCHORING ON CHAIN…' : 'ANCHOR SOUL ON RITUAL'}
                </button>
              </div>
              {error && <p className="mt-6 text-center text-sm text-red-300/90">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShareCardModal soul={soul} open={shareOpen} onClose={() => setShareOpen(false)} />
    </PageShell>
  );
}
