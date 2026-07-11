const DISCLAIMER =
  'Ritual testnet demo. Connecting your wallet triggers on-chain transactions (reading fee, optional RitualWallet deposit, optional LLM call). Your address and transaction stats are processed server-side and may be sent to an AI API. No NFT is minted. Not financial advice.';

const AUTHOR_X_URL = 'https://x.com/Felqeutler';

function AuthorCredit({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] text-white/35 ${className}`}>
      Built by{' '}
      <a
        href={AUTHOR_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/55 hover:text-white underline-offset-2 hover:underline"
      >
        @Felqeutler
      </a>
    </p>
  );
}

/** Testnet disclaimer shown site-wide */
export function SiteDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3 max-w-md mx-auto text-center">
        <p className="text-[11px] leading-relaxed text-white/40">{DISCLAIMER}</p>
        <AuthorCredit />
      </div>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-[#082820]/80 px-6 py-5 space-y-3">
      <p className="mx-auto max-w-3xl text-center text-[11px] leading-relaxed tracking-[0.2px] text-white/45">
        {DISCLAIMER}
      </p>
      <AuthorCredit className="text-center" />
    </footer>
  );
}
