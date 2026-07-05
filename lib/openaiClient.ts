/** OpenAI-compatible API client (server-side only) */

type OpenAiConfig = {
  baseURL: string;
  apiKey: string;
};

let cachedModel: string | null = null;

function getOpenAiConfig(): OpenAiConfig | null {
  const baseURL = process.env.OPENAI_BASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    return null;
  }

  return { baseURL, apiKey };
}

/** Fetch available models from the API */
export async function listAvailableModels(): Promise<string[]> {
  const config = getOpenAiConfig();
  if (!config) {
    throw new Error('OPENAI_BASE_URL or OPENAI_API_KEY is not configured');
  }

  const res = await fetch(`${config.baseURL}/models`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to fetch models (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    data?: { id: string }[];
  };

  return (data.data ?? []).map((item) => item.id).filter(Boolean);
}

/** Resolve model: env var first, otherwise first model from the API */
export async function resolveModel(): Promise<string> {
  const explicit = process.env.OPENAI_MODEL?.trim();
  if (explicit) {
    return explicit;
  }

  if (cachedModel) {
    return cachedModel;
  }

  const models = await listAvailableModels();
  if (models.length === 0) {
    throw new Error('No models returned from API — set OPENAI_MODEL in .env.local');
  }

  cachedModel = models[0];
  return cachedModel;
}

/** Call OpenAI-compatible chat completions */
export async function generateChatCompletion(prompt: string): Promise<string> {
  const config = getOpenAiConfig();
  if (!config) {
    throw new Error('OPENAI_BASE_URL or OPENAI_API_KEY is not configured');
  }

  const model = await resolveModel();

  const res = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM API error (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('LLM returned empty content');
  }

  return content;
}
