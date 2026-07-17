import type { SoulArchetype, DimensionScores } from '@/lib/soulFormula';

/** Visual style description per archetype */
const ARCHETYPE_VISUALS: Record<SoulArchetype, string> = {
  'The Silent Architect':
    'minimalist geometric architecture, precise clean lines, deep blue and slate tones, floating crystalline structures, mathematical harmony, dark background',
  'The Eternal DeGen':
    'explosive fiery energy, crimson and gold flames, chaotic lightning, volatile market charts dissolving into sparks, high contrast, dark background',
  'The Patient Oracle':
    'mystical oracle figure, purple and violet aurora, swirling cosmic eye, ancient runes, contemplative atmosphere, starfield, dark background',
  'The Phantom Collector':
    'ethereal floating artifacts, teal and mint glow, translucent museum of forgotten objects, spectral archives, mysterious fog, dark background',
  'The Ritual Weaver':
    'sacred geometric patterns, amber and gold ceremonial light, woven threads of light forming a tapestry, ritualistic symbols, warm glow, dark background',
  'The Sovereign Agent':
    'autonomous machine entity, pink and magenta neon circuitry, precise robotic precision, distributed network nodes, futuristic AI consciousness, dark background',
};

/** Build the image-generation prompt for the Image precompile */
export function buildImagePrompt(archetype: SoulArchetype, dimensions: DimensionScores): string {
  const visual = ARCHETYPE_VISUALS[archetype];
  const intensity = Math.round((dimensions.frequency + dimensions.gasIntensity + dimensions.risk) / 3);
  const complexity = Math.round(dimensions.diversity);

  return `${archetype.replace(/^The /, '')} — ${visual}. Energy intensity ${intensity}%, visual complexity ${complexity}%. Square composition, digital art, highly detailed, cinematic lighting, no text, no watermark.`;
}
