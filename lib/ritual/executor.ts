import { createPublicClient, http } from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';
import {
  CAPABILITY_IMAGE,
  CAPABILITY_LLM,
  SYSTEM_CONTRACTS,
  TEE_REGISTRY_ABI,
} from '@/lib/ritual/constants';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

/** Resolve an available TEE executor address for a given capability */
async function getExecutor(capability: number, label: string): Promise<`0x${string}`> {
  const services = await publicClient.readContract({
    address: SYSTEM_CONTRACTS.TEE_SERVICE_REGISTRY,
    abi: TEE_REGISTRY_ABI,
    functionName: 'getServicesByCapability',
    args: [capability, true],
  });

  const valid = services.find((s) => s.isValid);
  if (!valid) {
    throw new Error(`No valid ${label} executor on Ritual network`);
  }

  return valid.node.teeAddress;
}

/** Resolve an available LLM TEE executor address */
export async function getLlmExecutor(): Promise<`0x${string}`> {
  return getExecutor(CAPABILITY_LLM, 'LLM');
}

/** Resolve an available Image TEE executor address */
export async function getImageExecutor(): Promise<`0x${string}`> {
  return getExecutor(CAPABILITY_IMAGE, 'Image');
}
