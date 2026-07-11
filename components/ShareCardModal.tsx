'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Download, ExternalLink, Loader2, X } from 'lucide-react';
import type { SoulData } from '@/components/SoulCard';

interface ShareCardModalProps {
  soul: SoulData | null;
  open: boolean;
  onClose: () => void;
}

const archetypeColors: Record<string, string> = {
  'The Silent Architect': '#3b82f6',
  'The Eternal DeGen': '#ef4444',
  'The Patient Oracle': '#8b5cf6',
  'The Phantom Collector': '#14b8a6',
  'The Ritual Weaver': '#f59e0b',
  'The Sovereign Agent': '#ec4899',
};

const WIDTH = 1200;
const HEIGHT = 675;

/** 在 canvas 上绘制分享卡 */
function drawShareCard(canvas: HTMLCanvasElement, soul: SoulData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const accent = archetypeColors[soul.archetype] ?? '#14b8a6';
  const bg = '#0B2E26';
  const bgCard = '#05241F';
  const fg = '#F4F4EF';
  const muted = 'rgba(244,244,239,0.55)';
  const faint = 'rgba(244,244,239,0.3)';

  // 背景
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 顶部光晕
  const glow = ctx.createRadialGradient(WIDTH / 2, -100, 50, WIDTH / 2, -100, 600);
  glow.addColorStop(0, 'rgba(244,244,239,0.08)');
  glow.addColorStop(1, 'rgba(244,244,239,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 网格纹理
  ctx.strokeStyle = 'rgba(244,244,239,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // 顶部 accent 条
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, WIDTH, 4);

  // 底部 accent 光晕
  const bottomGlow = ctx.createRadialGradient(WIDTH / 2, HEIGHT + 50, 10, WIDTH / 2, HEIGHT + 50, 400);
  bottomGlow.addColorStop(0, accent + '40');
  bottomGlow.addColorStop(1, accent + '00');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, HEIGHT - 200, WIDTH, 200);

  // 顶部品牌
  ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = fg;
  ctx.fillText('Onchain Soul', 64, 70);

  ctx.font = '500 13px ui-monospace, monospace';
  ctx.fillStyle = muted;
  ctx.textAlign = 'right';
  ctx.fillText('RITUAL CHAIN • 1979', WIDTH - 64, 70);
  ctx.textAlign = 'left';

  // 灵魂 ID
  ctx.font = '500 12px ui-monospace, monospace';
  ctx.fillStyle = faint;
  ctx.fillText('SOUL ID', 64, 130);
  ctx.fillStyle = muted;
  ctx.font = '500 16px ui-monospace, monospace';
  ctx.fillText(`#${soul.id.slice(2, 10)}`, 64, 152);

  // Archetype 名
  ctx.font = '700 56px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = fg;
  ctx.fillText(soul.archetype, 64, 230);

  // 传记文本（自动换行）
  ctx.font = '400 19px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(244,244,239,0.8)';
  const maxWidth = WIDTH - 128;
  const words = soul.biography.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const maxLines = 4;
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    const last = displayLines[maxLines - 1];
    displayLines[maxLines - 1] = last.slice(0, Math.max(0, last.length - 3)) + '…';
  }

  displayLines.forEach((line, i) => {
    ctx.fillText(line, 64, 280 + i * 30);
  });

  // Traits
  ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif';
  let traitX = 64;
  const traitY = 280 + maxLines * 30 + 30;
  for (const trait of soul.traits) {
    const w = ctx.measureText(trait).width + 32;
    // 胶囊背景
    ctx.fillStyle = 'rgba(244,244,239,0.06)';
    ctx.beginPath();
    ctx.roundRect(traitX, traitY - 18, w, 30, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244,244,239,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 文字
    ctx.fillStyle = 'rgba(244,244,239,0.75)';
    ctx.fillText(trait, traitX + 16, traitY + 1);
    traitX += w + 10;
  }

  // 底部信息
  ctx.font = '500 13px ui-monospace, monospace';
  ctx.fillStyle = faint;
  ctx.fillText(soul.mintedAt, 64, HEIGHT - 56);

  ctx.fillStyle = muted;
  ctx.fillText(`TX ${soul.txHash.slice(0, 18)}…`, 64, HEIGHT - 36);

  ctx.textAlign = 'right';
  ctx.fillStyle = faint;
  ctx.font = '500 12px ui-monospace, monospace';
  ctx.fillText('explorer.ritualfoundation.org', WIDTH - 64, HEIGHT - 36);
  ctx.textAlign = 'left';
}

function buildTweetText(soul: SoulData): string {
  return `My on-chain soul is "${soul.archetype}".\n\nAI read my Ritual wallet history and wrote my biography on-chain.\n\nDiscover yours →`;
}

function buildTweetUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function ShareCardModal({ soul, open, onClose }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !soul) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 高分辨率
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawShareCard(canvas, soul);
  }, [open, soul]);

  const handleDownload = () => {
    if (!canvasRef.current || !soul) return;
    setRendering(true);
    try {
      const link = document.createElement('a');
      link.download = `onchain-soul-${soul.id.slice(2, 10)}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } finally {
      setRendering(false);
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b), 'image/png'),
      );
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板 API 部分浏览器不支持图片
    }
  };

  return (
    <AnimatePresence>
      {open && soul && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0F3D34] p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div id="share-modal-title" className="mb-4 text-center text-xl font-semibold tracking-[-0.5px] sm:text-2xl">
              Share your soul
            </div>

            {/* 卡片预览 */}
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <canvas
                ref={canvasRef}
                className="block w-full"
                style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
              />
            </div>

            {/* 操作按钮 */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={rendering}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-xs font-medium text-black transition-all hover:bg-white/90 disabled:opacity-60"
              >
                {rendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">PNG</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/20 text-xs font-medium transition-all hover:bg-white/5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                <span className="sm:hidden">{copied ? '✓' : 'Copy'}</span>
              </button>

              <a
                href={buildTweetUrl(buildTweetText(soul))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/20 text-xs font-medium transition-all hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Tweet</span>
                <span className="sm:hidden">X</span>
              </a>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-white/40">
              Download the PNG, or copy it and paste directly into a tweet.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
