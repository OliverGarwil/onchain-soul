'use client';

interface ProgressBarProps {
  value: number;
  active?: boolean;
  className?: string;
}

/** 统一进度条样式 */
export function ProgressBar({ value, active = false, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`h-1 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full bg-white/85 transition-[width] duration-500 ease-out ${active ? 'soul-progress-active' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
