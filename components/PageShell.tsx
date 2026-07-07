'use client';

import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

/** 页面外壳：统一深绿背景与网格纹理 */
export function PageShell({ children, header, className = '' }: PageShellProps) {
  return (
    <div className={`relative min-h-screen bg-[#0B2E26] text-[#F4F4EF] overflow-x-hidden ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(255_255_255/0.06),transparent)]"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        {header}
        {children}
      </div>
    </div>
  );
}
