import {
  createPublicClient,
  decodeAbiParameters,
  encodeAbiParameters,
  hexToBytes,
  http,
  parseAbiParameters,
  type Hash,
  type WalletClient,
} from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';
import type { WalletAnalysis } from '@/lib/analyzeWallet';
import { buildBiographyPrompt } from '@/lib/biographyPrompt';
import type { SoulResult } from '@/lib/soulFormula';
import { LLM_MODEL, PRECOMPILES } from '@/lib/ritual/constants';
import { getLlmExecutor } from '@/lib/ritual/executor';
import { ensureRitualWalletDeposit } from '@/lib/ritual/wallet';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

type RitualReceipt = {
  spcCalls?: { output?: `0x${string}` }[];
};

function encodeLlmRequest(executor: `0x${string}`, prompt: string): `0x${string}` {
  const messages = JSON.stringify([{ role: 'user', content: prompt }]);

  return encodeAbiParameters(
    parseAbiParameters(
      'address, bytes[], uint256, bytes[], bytes, string, string, int256, string, bool, int256, string, string, uint256, bool, int256, string, bytes, int256, string, string, bool, int256, bytes, bytes, int256, int256, string, bool, (string,string,string)'
    ),
    [
      executor,
      [],
      BigInt(100),
      [],
      '0x',
      messages,
      LLM_MODEL,
      BigInt(0),
      '',
      false,
      BigInt(-1),
      '',
      '',
      BigInt(1),
      false,
      BigInt(0),
      '',
      '0x',
      BigInt(-1),
      '',
      '',
      false,
      BigInt(700),
      '0x',
      '0x',
      BigInt(-1),
      BigInt(1000),
      '',
      false,
      ['gcs', 'convos/session.jsonl', 'GCS_CREDS'],
    ]
  );
}

function decodeLlmText(output: `0x${string}`): string {
  const [hasError, completionData, , errorMessage] = decodeAbiParameters(
    parseAbiParameters('bool, bytes, bytes, string, (string,string,string)'),
    output
  );

  if (hasError) {
    throw new Error(errorMessage || 'LLM precompile error');
  }

  const raw = new TextDecoder().decode(hexToBytes(completionData));
  try {
    const json = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[];
      content?: string;
      text?: string;
    };
    const fromChoices = json.choices?.[0]?.message?.content;
    if (fromChoices) return fromChoices.trim();
    if (json.content) return json.content.trim();
    if (json.text) return json.text.trim();
  } catch {
    // Not JSON — return raw text
  }

  const trimmed = raw.trim();
  if (trimmed) return trimmed;
  throw new Error('Empty LLM response');
}

/** Generate on-chain biography via Ritual LLM precompile (0x0802) */
export async function generateBiographyOnChain(
  walletClient: WalletClient,
  userAddress: `0x${string}`,
  analysis: WalletAnalysis,
  result: SoulResult
): Promise<{ biography: string; txHash: Hash }> {
  await ensureRitualWalletDeposit(walletClient, userAddress);

  const executor = await getLlmExecutor();
  const prompt = buildBiographyPrompt(analysis, result);
  const data = encodeLlmRequest(executor, prompt);

  const hash = await walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: PRECOMPILES.LLM,
    data,
    gas: BigInt(3_000_000),
  });

  const receipt = (await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 120_000,
  })) as RitualReceipt;

  const output = receipt.spcCalls?.[0]?.output;
  if (!output) {
    throw new Error('No spcCalls output in receipt');
  }

  const biography = decodeLlmText(output);
  return { biography, txHash: hash };
}
