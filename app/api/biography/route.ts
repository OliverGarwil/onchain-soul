import { NextResponse } from 'next/server';
import type { WalletAnalysis } from '@/lib/analyzeWallet';
import { buildBiographyPrompt } from '@/lib/biographyPrompt';
import { generateChatCompletion, resolveModel } from '@/lib/openaiClient';
import type { SoulResult } from '@/lib/soulFormula';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      analysis?: WalletAnalysis;
      result?: SoulResult;
    };

    if (!body.analysis || !body.result) {
      return NextResponse.json({ error: 'Missing analysis or result' }, { status: 400 });
    }

    const prompt = buildBiographyPrompt(body.analysis, body.result);
    const biography = await generateChatCompletion(prompt);
    const model = await resolveModel();

    return NextResponse.json({
      biography,
      model,
      source: 'openai-compatible',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate biography';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
