import { createPublicClient, http } from 'viem';
import { ritualChain, RITUAL_RPC } from '@/lib/ritual';
import {
  CAPABILITY_LLM,
  SYSTEM_CONTRACTS,
  TEE_REGISTRY_ABI,
} from '@/lib/ritual/constants';

const publicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC),
});

/** Resolve an available LLM TEE executor address */
export async function getLlmExecutor(): Promise<`0x${string}`> {
  const services = await publicClient.readContract({
    address: SYSTEM_CONTRACTS.TEE_SERVICE_REGISTRY,
    abi: TEE_REGISTRY_ABI,
    functionName: 'getServicesByCapability',
    args: [CAPABILITY_LLM, true],
  });

  const valid = services.find((s) => s.isValid);
  if (!valid) {
    throw new Error('No valid LLM executor on Ritual network');
  }

  return valid.node.teeAddress;
}
