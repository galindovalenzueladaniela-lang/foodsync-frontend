import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '../lib/cn';

interface Props {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  hint?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/** Fila seleccionable (variante, extra, propina, método de pago). Usa inputs nativos para accesibilidad. */
export function ChoiceRow({ type, name, checked, onChange, label, hint, aside, className }: Props) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm transition-colors',
        'has-[:focus-visible]:shadow-focus',
        checked && type === 'radio' ? 'border-[1.5px] border-primary bg-primary-soft' : 'border border-line-subtle bg-elevated hover:bg-surface',
        className,
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {type === 'radio' ? (
        <span aria-hidden="true" className={cn('h-4 w-4 shrink-0 rounded-full', checked ? 'border-[5px] border-primary' : 'border-[1.5px] border-[#CDBFAF]')} />
      ) : (
        <span
          aria-hidden="true"
          className={cn('inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]', checked ? 'border-primary bg-primary text-on-primary' : 'border-[#CDBFAF] bg-elevated')}
        >
          {checked && <Icon name="check" size={12} strokeWidth={2.4} />}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col leading-[15px]">
        <span className="truncate">{label}</span>
        {hint && <span className="text-[11px] font-medium text-ink-secondary">{hint}</span>}
      </span>
      {aside && <span className="text-ink-secondary">{aside}</span>}
    </label>
  );
}
