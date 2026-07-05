# Onchain Soul — Ritual Chain

> **Discover your on-chain soul.**  
> Ritual on-chain behavior → 7-dimensional soul formula → AI biography → SoulCard → on-chain anchor.

A consumer dApp on Ritual testnet (Chain ID **1979**) that turns wallet transaction history into a shareable on-chain identity — archetype, biography, dimension radar, and anchor record.

## Feature status

| Module | Status | Notes |
|--------|--------|-------|
| Wallet connect | ✅ | wagmi + Ritual testnet |
| Transaction analysis | ✅ | RPC / explorer history, 7D formula + 6 archetypes |
| On-chain LLM biography | ✅ | Ritual LLM precompile `0x0802` |
| API biography fallback | ✅ | `/api/biography` (OpenAI-compatible) |
| Template biography fallback | ✅ | Used when on-chain / API both fail |
| SoulCard UI | ✅ | Radar chart, time distribution, share card |
| On-chain anchor | ✅ | Self-transfer + SOUL calldata (MVP, not full ERC-721) |
| Image PFP precompile | 🚧 | `0x0818` not wired yet |
| ERC-721 contract | 🚧 | Planned |
| Check-in / leaderboard | 🚧 | Planned |

## Tech stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Chain**: Ritual Testnet (1979), RPC `https://rpc.ritualfoundation.org`
- **Wallet**: wagmi + viem
- **AI**: On-chain LLM precompile → server OpenAI-compatible API → static template (3-tier fallback)

## Quick start

### 1. Prerequisites

- Node.js 20+
- npm 10+

### 2. Install & configure

```bash
git clone <your-repo-url> onchain-soul
cd onchain-soul
npm install
cp .env.example .env.local
```

Edit `.env.local` (required for **API biography fallback**; optional if you only use on-chain LLM):

```env
OPENAI_BASE_URL=https://your-api-host/v1
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-5.5
```

Validate environment:

```bash
npm run check:env
```

### 3. Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Connect wallet on **Ritual testnet (1979)**
2. Get test RITUAL: [Ritual Faucet](https://faucet.ritualfoundation.org)
3. Go to **Discover Soul** to run analysis and biography generation

### 4. Production build

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_BASE_URL` | For fallback | OpenAI-compatible API base URL, must include `/v1` |
| `OPENAI_API_KEY` | For fallback | API key |
| `OPENAI_MODEL` | No | Model ID; defaults to first entry from `/models` |

> Variables are **server-side only** (API Routes). See [`.env.example`](.env.example).

## API

### `POST /api/biography`

Biography fallback when on-chain LLM fails.

**Body**

```json
{
  "analysis": { "...": "WalletAnalysis" },
  "result": { "...": "SoulResult" }
}
```

**Response**

```json
{
  "biography": "...",
  "model": "gpt-5.5",
  "source": "openai-compatible"
}
```

### `GET /api/models`

List available models from the OpenAI-compatible API and the active model.

## Deploy (Vercel)

1. Import repo to [Vercel](https://vercel.com)
2. Framework preset: **Next.js** ([`vercel.json`](vercel.json) included)
3. Add the three env vars under Project Settings → Environment Variables
4. Deploy

After deploy, verify:

- Wallet connects on Ritual 1979
- `/discover` biography fallback works (test with `GET /api/models` first)

Other hosts (Docker / self-hosted): `npm run build && npm run start` on port 3000.

## Project structure

```
app/
  page.tsx              # Landing page
  discover/page.tsx     # Soul discovery flow
  api/
    biography/route.ts  # Biography API fallback
    models/route.ts     # Model list
components/             # UI components
lib/
  analyzeWallet.ts      # On-chain data analysis
  soulFormula.ts        # 7D formula & archetypes
  ritual/               # LLM precompile, anchor, executor
  openaiClient.ts       # OpenAI-compatible client
  env.ts                # Server env validation
scripts/check-env.mjs   # Local env check script
```

## Biography pipeline

```
Analyze wallet
  → Soul formula / archetype
  → Try on-chain LLM (0x0802)
       ↓ fail
  → POST /api/biography (OpenAI-compatible)
       ↓ fail
  → Built-in template biography
  → SoulCard + optional on-chain anchor
```

## Design

- Dark terminal aesthetic aligned with Ritual dApp style
- Mobile-first with Framer Motion
- SoulCard optimized for screenshots / sharing

## Roadmap

- [ ] ERC-721 Soul NFT contract + metadata
- [ ] Image precompile PFP (0x0818)
- [ ] Daily Soul Check-in & evolution tracking
- [ ] Leaderboard & X share card polish

## License

Private project (`private: true`). Add a LICENSE file before open-sourcing.

---

Built for the Ritual community — a consumer dApp experience powered by Ritual AI precompiles.
