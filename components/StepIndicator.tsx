'use client';

const STEPS = ['Awaken', 'Open', 'Read', 'Reveal'] as const;

interface StepIndicatorProps {
  /** 0-3 maps to the four flow steps */
  current: number;
}

/** Step indicator for the discover flow */
export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mb-10 flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5 min-w-[3.5rem]">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-mono transition-colors ${
                  done
                    ? 'border-white/30 bg-white/15 text-white'
                    : active
                      ? 'border-white bg-white text-[#0B2E26]'
                      : 'border-white/15 text-white/35'
                }`}
              >
                {done ? '✓' : `0${index + 1}`}
              </div>
              <span
                className={`hidden text-[9px] tracking-[1px] sm:block ${
                  active ? 'text-white/80' : 'text-white/35'
                }`}
              >
                {label.toUpperCase()}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mb-4 h-px w-6 sm:w-10 ${index < current ? 'bg-white/35' : 'bg-white/10'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
