#!/usr/bin/env node
/**
 * Validate local environment variables for dev/production minimum requirements.
 * Usage: npm run check:env
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envLocal = resolve(root, '.env.local');
const envExample = resolve(root, '.env.example');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const fromFile = loadEnvFile(envLocal);
const merged = { ...fromFile, ...process.env };

const required = ['OPENAI_BASE_URL', 'OPENAI_API_KEY'];
const optional = ['OPENAI_MODEL'];

console.log('Onchain Soul — environment check\n');

if (!existsSync(envLocal)) {
  console.warn('⚠  .env.local not found');
  if (existsSync(envExample)) {
    console.warn('   Run: cp .env.example .env.local\n');
  }
}

const missing = required.filter((key) => !merged[key]);
const presentOptional = optional.filter((key) => merged[key]);

if (missing.length === 0) {
  console.log('✓ LLM API fallback is fully configured');
  console.log(`  OPENAI_BASE_URL=${merged.OPENAI_BASE_URL}`);
  console.log(`  OPENAI_API_KEY=${merged.OPENAI_API_KEY.slice(0, 8)}…`);
} else {
  console.log('○ LLM API fallback not configured (on-chain LLM + template biography still work)');
  console.log(`  Missing: ${missing.join(', ')}`);
}

if (presentOptional.length) {
  console.log(`  Optional: ${presentOptional.map((k) => `${k}=${merged[k]}`).join(', ')}`);
}

console.log('\nRitual testnet: Chain ID 1979, faucet https://faucet.ritualfoundation.org');
process.exit(0);
