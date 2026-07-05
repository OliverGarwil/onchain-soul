/** Testnet disclaimer shown site-wide */
export function SiteDisclaimer({ compact = false }: { compact?: boolean }) {
  const text =
    'Testnet demo only. Connecting your wallet will prompt multiple transactions (reading fee, optional RitualWallet deposit, optional LLM call). Your wallet address and transaction statistics are sent to our server and optionally to an AI API. No NFT is minted. Not financial advice.';

  if (compact) {
    return (
      <p className="text-[11px] leading-relaxed text-white/40 max-w-md mx-auto text-center">{text}</p>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-[#082820]/80 px-6 py-5">
      <p className="mx-auto max-w-3xl text-center text-[11px] leading-relaxed tracking-[0.2px] text-white/45">
        {text}
      </p>
    </footer>
  );
}
