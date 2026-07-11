import { NextResponse } from 'next/server';
import type { SoulArchetype, DimensionScores } from '@/lib/soulFormula';
import { buildImagePrompt } from '@/lib/imagePrompt';
import { getServerEnv } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      archetype?: SoulArchetype;
      dimensions?: DimensionScores;
    };

    if (!body.archetype || !body.dimensions) {
      return NextResponse.json({ error: 'Missing archetype or dimensions' }, { status: 400 });
    }

    const env = getServerEnv();
    if (!env) {
      return NextResponse.json({ error: 'Image API fallback not configured' }, { status: 503 });
    }

    const prompt = buildImagePrompt(body.archetype, body.dimensions);

    const res = await fetch(`${env.openaiBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: env.openaiModel || 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Image API error (${res.status}): ${detail.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: { b64_json?: string; url?: string }[];
      images?: { b64_json?: string; url?: string }[];
    };

    const item = data.data?.[0] ?? data.images?.[0];
    if (!item) {
      return NextResponse.json({ error: 'No image in API response' }, { status: 502 });
    }

    const imageUrl = item.b64_json
      ? `data:image/png;base64,${item.b64_json}`
      : item.url ?? null;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image data returned' }, { status: 502 });
    }

    return NextResponse.json({ imageUrl, source: 'openai-compatible' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
