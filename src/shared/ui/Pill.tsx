import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Tone = 'primary' | 'primary-soft' | 'accent' | 'success' | 'warning' | 'neutral' | 'glass-success';

const tones: Record<Tone, string> = {
  primary: 'bg-primary text-on-primary',
  'primary-soft': 'bg-primary-soft text-primary',
  accent: 'bg-accent text-ink',
  success: 'bg-success-soft text-success-text',
  'glass-success': 'bg-surface/90 text-success-text backdrop-blur-[10px]',
  warning: 'bg-warning-soft text-warning-text',
  neutral: 'bg-[#EFE8DF] text-[#6B5E54]',
};

export function Pill({ tone = 'primary-soft', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-semibold leading-4', tones[tone], className)}>
      {children}
    </span>
  );
}
