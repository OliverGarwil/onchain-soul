/** Server environment validation (API Routes / Node only — do not import on the client) */

export type ServerEnv = {
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiModel?: string;
};

const REQUIRED_KEYS = ['OPENAI_BASE_URL', 'OPENAI_API_KEY'] as const;
const OPTIONAL_KEYS = ['OPENAI_MODEL'] as const;

/** Read configured server env; returns null when LLM fallback is not configured */
export function getServerEnv(): ServerEnv | null {
  const baseUrl = process.env.OPENAI_BASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL?.trim();
  return {
    openaiBaseUrl: baseUrl,
    openaiApiKey: apiKey,
    openaiModel: model || undefined,
  };
}

/** Require full LLM fallback env or throw a readable error */
export function requireServerEnv(): ServerEnv {
  const env = getServerEnv();
  if (!env) {
    throw new Error(
      'Missing OPENAI_BASE_URL or OPENAI_API_KEY. Copy .env.example to .env.local and fill in the values.'
    );
  }
  return env;
}

/** Environment summary for startup scripts / health checks */
export function getEnvStatus() {
  const missing = REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());
  const optional = OPTIONAL_KEYS.filter((key) => Boolean(process.env[key]?.trim()));

  return {
    llmFallbackReady: missing.length === 0,
    missing,
    optional,
    note:
      missing.length > 0
        ? 'On-chain LLM still works; API biography fallback needs the missing variables'
        : 'API biography fallback is ready',
  };
}
