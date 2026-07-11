'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ConnectButton } from '@/components/ConnectButton';
import { GalleryModal } from '@/components/GalleryModal';
import { PageShell } from '@/components/PageShell';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function OnchainSoulLanding() {
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  return (
    <PageShell
      header={
        <nav className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <img src="/logo.png" alt="Onchain Soul" className="h-9 w-9 rounded-lg" />
            <div className="font-semibold tracking-[-0.02em]">Onchain Soul</div>
          </Link>
          <div className="flex items-center gap-3 text-sm sm:gap-4">
            <a href="#how" className="hidden text-white/60 transition-colors hover:text-white sm:inline">
              How it works
            </a>
            <ConnectButton variant="nav" />
          </div>
        </nav>
      }
    >
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.08 }}
        className="overflow-hidden"
      >
        {/* Hero */}
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-28">
          <motion.div
            {...fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] tracking-[0.5px] sm:text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" /> POWERED BY RITUAL LLM + IMAGE PRECOMPILES
          </motion.div>

          <motion.h1
            {...fadeUp}
            className="mb-6 text-[2.75rem] font-semibold leading-[0.95] tracking-[-3px] sm:text-7xl md:text-[88px] md:tracking-[-4.5px]"
          >
            <span className="text-white/55">Every wallet</span>
            <br />
            <span className="text-white/55">has a soul.</span>
            <br />
            <span className="text-white">Now it speaks.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            className="mx-auto mb-10 max-w-md text-lg leading-snug tracking-[-0.25px] text-white/55 sm:text-[21px]"
          >
            On-chain AI reads your Ritual history — then writes the story only you could live.
          </motion.p>

          <motion.div {...fadeUp} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/discover"
              className="group flex h-14 w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-white px-9 text-lg font-medium text-black transition-all hover:bg-white/90 active:bg-white sm:w-auto"
            >
              Discover your soul
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* How it works */}
        <div id="how" className="mx-auto max-w-5xl px-5 pb-24 pt-4 sm:px-8 sm:pb-32">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs tracking-[2px] text-white/40">THREE STEPS. ONE SOUL.</div>
            <div className="text-4xl tracking-[-1.2px] sm:text-5xl sm:tracking-[-1.5px]">How your soul is born</div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                num: '01',
                title: 'Connect',
                desc: 'Link your Ritual wallet. We read your on-chain history — every contract, every interaction, every trace you left.',
              },
              {
                num: '02',
                title: 'AI reads you',
                desc: "Ritual LLM (0x0802) analyzes your behavior inside a TEE. It doesn't guess — it studies the actual transactions you signed.",
              },
              {
                num: '03',
                title: 'Receive your soul',
                desc: 'You get a living soul card: personality archetype, written biography, and generative PFP. Anchor it on-chain.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group rounded-3xl border border-white/10 bg-white/[0.015] p-7 transition-all hover:border-white/20 hover:bg-white/[0.025] sm:p-8"
              >
                <div className="font-mono text-[56px] tracking-[-4px] text-white/10 transition-colors group-hover:text-white/20 sm:text-[72px]">
                  {step.num}
                </div>
                <div className="mb-4 mt-2 text-2xl tracking-[-1px] sm:text-3xl">{step.title}</div>
                <p className="text-base leading-snug text-white/60 sm:text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="border-t border-white/10 py-12 text-center sm:py-16">
          <div className="px-5 text-3xl tracking-[-1.2px] sm:text-5xl sm:tracking-[-1.8px]">
            Ready to meet the version of you
            <br />
            only the chain knows?
          </div>
          <Link
            href="/discover"
            className="mt-8 inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-10 text-lg font-medium text-black transition-all active:bg-white/90"
          >
            Connect wallet &amp; begin <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </motion.div>

      <GalleryModal open={showGalleryModal} onClose={() => setShowGalleryModal(false)} />
    </PageShell>
  );
}
