'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
}

export function GalleryModal({ open, onClose }: GalleryModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0F3D34] p-9 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 text-white/40 transition-colors hover:text-white/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-8 w-8 text-white/70" />
            </div>

            <div id="gallery-modal-title" className="mb-3 text-3xl tracking-[-0.8px]">
              Gallery coming soon
            </div>
            <p className="text-lg leading-snug text-white/70">
              We&apos;re building the soul gallery.
              <br />
              Stay tuned.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 h-12 w-full rounded-2xl border border-white/20 text-sm tracking-[1px] transition-all hover:bg-white/5"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
