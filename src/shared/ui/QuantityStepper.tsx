import { Icon } from './Icon';
import { cn } from '../lib/cn';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  /** Con `removable`, en 1 el botón de restar se convierte en eliminar (pantalla Tu pedido). */
  removable?: boolean;
  size?: 'sm' | 'md';
  label: string;
}

export function QuantityStepper({ value, onChange, min = 1, removable, size = 'sm', label }: Props) {
  const d = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const showDelete = removable && value <= 1;
  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center rounded-full border border-line-subtle bg-primary-soft/70 p-0.5', size === 'md' && 'p-1')}>
      <button
        type="button"
        aria-label={showDelete ? 'Quitar del pedido' : 'Quitar uno'}
        disabled={!removable && value <= min}
        onClick={() => onChange(value - 1)}
        className={cn(d, 'inline-flex items-center justify-center rounded-full bg-elevated text-primary shadow-xs transition hover:bg-surface disabled:opacity-40')}
      >
        <Icon name={showDelete ? 'eliminar' : 'menos'} size={14} />
      </button>
      <span aria-live="polite" className={cn('min-w-6 text-center font-bold text-primary', size === 'sm' ? 'text-sm' : 'w-8 text-base')}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Agregar uno"
        onClick={() => onChange(value + 1)}
        className={cn(d, 'inline-flex items-center justify-center rounded-full bg-primary text-on-primary transition hover:bg-primary-hover')}
      >
        <Icon name="agregar" size={14} />
      </button>
    </div>
  );
}
