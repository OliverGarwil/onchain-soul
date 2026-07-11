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

/** Site footer with author credit */
export function SiteDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="max-w-md mx-auto text-center">
        <AuthorCredit />
      </div>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-[#082820]/80 px-6 py-5">
      <AuthorCredit className="text-center" />
    </footer>
  );
}
