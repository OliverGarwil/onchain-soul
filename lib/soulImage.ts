import type { SoulArchetype } from '@/components/SoulCard';

const ARCHETYPE_COLORS: Record<SoulArchetype, { primary: string; secondary: string }> = {
  'The Silent Architect': { primary: '#3b82f6', secondary: '#1e3a5f' },
  'The Eternal DeGen': { primary: '#ef4444', secondary: '#7f1d1d' },
  'The Patient Oracle': { primary: '#8b5cf6', secondary: '#4c1d95' },
  'The Phantom Collector': { primary: '#14b8a6', secondary: '#134e4a' },
  'The Ritual Weaver': { primary: '#f59e0b', secondary: '#78350f' },
  'The Sovereign Agent': { primary: '#ec4899', secondary: '#831843' },
};

/** Convert a hex address into a deterministic seed */
function seedFromAddress(address: string): number[] {
  const clean = address.replace(/^0x/i, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16) || 0);
  }
  return bytes;
}

/** Simple deterministic PRNG */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic SVG soul image (no external deps, unique per wallet)
 * Returns a base64 data URL usable directly as <img src>
 */
export function generateSoulSvgDataUrl(address: string, archetype: SoulArchetype): string {
  const colors = ARCHETYPE_COLORS[archetype] ?? { primary: '#14b8a6', secondary: '#05241F' };
  const seedBytes = seedFromAddress(address);
  const seed = seedBytes.reduce((acc, b, i) => acc + b * (i + 1), 0);
  const rand = mulberry32(seed);

  const size = 800;
  const cx = size / 2;
  const cy = size / 2;

  // Background gradient
  const bgGradient = `
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${colors.secondary}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#041915" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${colors.primary}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `;

  // Concentric geometric rings
  const rings: string[] = [];
  const ringCount = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < ringCount; i++) {
    const r = 80 + i * 50 + rand() * 20;
    const opacity = 0.15 + rand() * 0.25;
    const dash = rand() > 0.5 ? `stroke-dasharray="${4 + rand() * 12} ${6 + rand() * 10}"` : '';
    rings.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.primary}" stroke-width="${1 + rand() * 2}" stroke-opacity="${opacity}" ${dash}/>`
    );
  }

  // Scattered nodes
  const nodes: string[] = [];
  const nodeCount = 8 + Math.floor(rand() * 8);
  for (let i = 0; i < nodeCount; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 60 + rand() * 280;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const r = 2 + rand() * 6;
    const opacity = 0.3 + rand() * 0.5;
    nodes.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${colors.primary}" fill-opacity="${opacity.toFixed(2)}"/>`
    );
  }

  // Center marker
  const centerShape =
    rand() > 0.5
      ? `<polygon points="${cx},${cy - 30} ${cx + 26},${cy + 15} ${cx - 26},${cy + 15}" fill="${colors.primary}" fill-opacity="0.7"/>`
      : `<circle cx="${cx}" cy="${cy}" r="28" fill="${colors.primary}" fill-opacity="0.6"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bgGradient}
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <rect width="${size}" height="${size}" fill="url(#glow)"/>
    ${rings.join('')}
    ${nodes.join('')}
    ${centerShape}
    <text x="${cx}" y="${size - 40}" text-anchor="middle" font-family="monospace" font-size="14" fill="${colors.primary}" fill-opacity="0.6" letter-spacing="3">ONCHAIN SOUL</text>
  </svg>`;

  // Convert to base64 data URL
  const base64 = typeof window === 'undefined'
    ? Buffer.from(svg).toString('base64')
    : btoa(unescape(encodeURIComponent(svg)));

  return `data:image/svg+xml;base64,${base64}`;
}
