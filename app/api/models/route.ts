import { NextResponse } from 'next/server';
import { listAvailableModels, resolveModel } from '@/lib/openaiClient';

export async function GET() {
  try {
    const models = await listAvailableModels();
    const activeModel = await resolveModel();

    return NextResponse.json({
      models,
      activeModel,
      source: 'openai-compatible',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch model list';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
