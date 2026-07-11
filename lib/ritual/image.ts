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
import { IMAGE_MODEL, PRECOMPILES } from '@/lib/ritual/constants';
import { getImageExecutor } from '@/lib/ritual/executor';
import { ensureRitualWalletDeposit } from '@/lib/ritual/wallet';
import type { SoulArchetype, DimensionScores } from '@/lib/soulFormula';
import { buildImagePrompt } from '@/lib/imagePrompt';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

type RitualReceipt = {
  spcCalls?: { output?: `0x${string}` }[];
};

/** 编码 Image 预编译请求（异步预编译格式，与 LLM 0x0802 同构） */
function encodeImageRequest(executor: `0x${string}`, prompt: string): `0x${string}` {
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
      IMAGE_MODEL,
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

/** 解码 Image 预编译输出，返回 base64 data URL */
function decodeImageOutput(output: `0x${string}`): string {
  const [hasError, imageData, , errorMessage] = decodeAbiParameters(
    parseAbiParameters('bool, bytes, bytes, string, (string,string,string)'),
    output
  );

  if (hasError) {
    throw new Error(errorMessage || 'Image precompile error');
  }

  const bytes = hexToBytes(imageData);
  // 尝试检测是否为 JSON 包装（某些预编译返回 URL 或 base64 字符串）
  try {
    const raw = new TextDecoder().decode(bytes);
    const json = JSON.parse(raw) as {
      images?: { b64_json?: string; url?: string }[];
      data?: { b64_json?: string; url?: string }[];
      url?: string;
      b64_json?: string;
    };

    const fromImages = json.images?.[0]?.b64_json;
    if (fromImages) return `data:image/png;base64,${fromImages}`;
    const fromImagesUrl = json.images?.[0]?.url;
    if (fromImagesUrl) return fromImagesUrl;
    const fromData = json.data?.[0]?.b64_json;
    if (fromData) return `data:image/png;base64,${fromData}`;
    const fromDataUrl = json.data?.[0]?.url;
    if (fromDataUrl) return fromDataUrl;
    if (json.b64_json) return `data:image/png;base64,${json.b64_json}`;
    if (json.url) return json.url;
  } catch {
    // 非 JSON — 检查是否为直接 base64 或二进制图片
  }

  // 二进制图片数据 → base64 data URL
  if (bytes.length > 0) {
    // PNG 魔数 0x89504E47 或 JPEG 魔数 0xFFD8
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    if (isPng || isJpeg) {
      const mime = isPng ? 'image/png' : 'image/jpeg';
      const base64 = btoa(String.fromCharCode(...bytes));
      return `data:${mime};base64,${base64}`;
    }

    // 可能是 base64 字符串
    const raw = new TextDecoder().decode(bytes).trim();
    if (raw.startsWith('http')) return raw;
    if (/^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 100) {
      return `data:image/png;base64,${raw}`;
    }
  }

  throw new Error('Unrecognized image precompile output format');
}

/** 通过 Ritual Image 预编译 (0x0818) 生成灵魂 PFP */
export async function generateImageOnChain(
  walletClient: WalletClient,
  userAddress: `0x${string}`,
  archetype: SoulArchetype,
  dimensions: DimensionScores
): Promise<{ imageUrl: string; txHash: Hash }> {
  await ensureRitualWalletDeposit(walletClient, userAddress);

  const executor = await getImageExecutor();
  const prompt = buildImagePrompt(archetype, dimensions);
  const data = encodeImageRequest(executor, prompt);

  const hash = await walletClient.sendTransaction({
    account: userAddress,
    chain: ritualChain,
    to: PRECOMPILES.IMAGE,
    data,
    gas: BigInt(5_000_000),
  });

  const receipt = (await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 180_000,
  })) as RitualReceipt;

  const output = receipt.spcCalls?.[0]?.output;
  if (!output) {
    throw new Error('No spcCalls output in image receipt');
  }

  const imageUrl = decodeImageOutput(output);
  return { imageUrl, txHash: hash };
}
