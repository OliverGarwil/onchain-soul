'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Zap, X } from 'lucide-react';
import { ConnectButton } from '@/components/ConnectButton';

export default function OnchainSoulLanding() {
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B2E26] text-[#F4F4EF] font-sans overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-40" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Onchain Soul" className="w-9 h-9" />
            <div className="font-semibold tracking-[-0.02em]">Onchain Soul</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#how" className="text-white/60 hover:text-white transition-colors">How it works</a>
            <button 
              onClick={() => setShowGalleryModal(true)}
              className="text-white/60 hover:text-white transition-colors"
            >
              Gallery
            </button>
            <ConnectButton variant="nav" />
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.5px] mb-6">
            <Sparkles className="w-3.5 h-3.5" /> POWERED BY RITUAL LLM + IMAGE PRECOMPILES
          </div>

          <h1 className="text-7xl md:text-[88px] font-semibold tracking-[-4.5px] leading-[0.92] mb-6">
            Your chain<br />has a soul.<br />Now it has a voice.
          </h1>

          <p className="max-w-md mx-auto text-[21px] text-white/60 tracking-[-0.25px] mb-10 leading-tight">
            AI reads every transaction you&apos;ve made on Ritual.<br />Then writes the story only you could live.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/discover"
              className="group flex items-center justify-center gap-3 px-9 h-14 rounded-2xl bg-white text-black text-lg font-medium hover:bg-white/90 active:bg-white transition-all"
            >
              Discover your soul
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <button
              onClick={() => setShowGalleryModal(true)}
              className="flex items-center justify-center gap-3 px-9 h-14 rounded-2xl border border-white/20 hover:bg-white/5 text-lg transition-all"
            >
              See the gallery
            </button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-9 text-sm text-white/40">
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 2,847 souls minted</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> 11,392 soul checks today</div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-y border-white/10 py-5">
          <div className="max-w-5xl mx-auto px-8 flex flex-wrap justify-center gap-x-12 gap-y-3 text-xs tracking-[1px] text-white/40">
            <div>CHAIN ID 1979</div>
            <div>LLM PRECOMPILE 0x0802</div>
            <div>IMAGE PRECOMPILE 0x0818</div>
            <div>TEE ATTESTED</div>
            <div>EVERY SOUL IS VERIFIABLE</div>
          </div>
        </div>

        {/* How it works */}
        <div id="how" className="max-w-5xl mx-auto px-8 pt-20 pb-24">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[2px] text-white/40 mb-3">THREE STEPS. ONE SOUL.</div>
            <div className="text-5xl tracking-[-1.5px]">How your soul is born</div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Connect', desc: 'Link your Ritual wallet. We read your on-chain history — every contract, every interaction, every trace you left.' },
              { num: '02', title: 'AI reads you', desc: 'Ritual LLM (0x0802) analyzes your behavior inside a TEE. It doesn\'t guess — it studies the actual transactions you signed.' },
              { num: '03', title: 'Receive your soul', desc: 'You get a living NFT: personality archetype, written biography, and generative PFP. Mint it. It evolves with you.' },
            ].map((step, i) => (
              <div key={i} className="group rounded-3xl border border-white/10 bg-white/[0.015] p-8 hover:border-white/20 transition-all">
                <div className="text-[72px] font-mono tracking-[-4px] text-white/10 group-hover:text-white/20 transition-colors">{step.num}</div>
                <div className="text-3xl tracking-[-1px] mt-2 mb-4">{step.title}</div>
                <p className="text-lg leading-snug text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA band */}
        <div className="border-t border-white/10 py-16 text-center">
          <div className="text-5xl tracking-[-1.8px] mb-4">Ready to meet the version of you<br />only the chain knows?</div>
          <a
            href="/discover"
            className="mt-8 px-10 h-14 rounded-2xl bg-white text-black text-lg font-medium inline-flex items-center gap-3 active:bg-white/90"
          >
            Connect wallet &amp; begin <ArrowRight className="w-5 h-5" />
          </a>
          <div className="mt-4 text-xs text-white/40">Testnet only • No real value • Pure ritual</div>
        </div>
      </div>

      {/* Gallery coming soon modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0F3D34] p-9 text-center"
            >
              <button
                onClick={() => setShowGalleryModal(false)}
                className="absolute right-5 top-5 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10">
                <Sparkles className="w-8 h-8 text-white/70" />
              </div>

              <div className="text-3xl tracking-[-0.8px] mb-3">Gallery coming soon</div>
              <p className="text-lg text-white/70 leading-snug">
                We&apos;re building the soul gallery.<br />Stay tuned.
              </p>

              <button
                onClick={() => setShowGalleryModal(false)}
                className="mt-8 w-full h-12 rounded-2xl border border-white/20 hover:bg-white/5 text-sm tracking-[1px] transition-all"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
