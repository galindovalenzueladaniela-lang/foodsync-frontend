import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '../lib/cn';

export function RoundIconButton({ icon, className, ...rest }: { icon: IconName } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn('floating inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-elevated', className)} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}
