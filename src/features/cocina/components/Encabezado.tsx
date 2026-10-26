import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../../shared/lib/cn';
import { horaLocal } from '../lib/tiempo';

/** Navbar de cada pantalla de cocina: título en serif a la izquierda y controles a la derecha. */
export function Encabezado({ titulo, children, className }: { titulo: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex flex-wrap items-center gap-x-[18px] gap-y-3', className)}>
      <h1 className="display text-[38px] leading-10">{titulo}</h1>
      {children}
    </header>
  );
}

/** Reloj del pase (avanza solo). */
export function Reloj({ className }: { className?: string }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1_000);
    return () => clearInterval(t);
  }, []);
  return (
    <time dateTime={new Date(ahora).toISOString()} className={cn('display text-[34px] leading-9 tabular-nums text-line-subtle', className)}>
      {horaLocal(ahora)}
    </time>
  );
}

/** Grupo de opciones tipo píldora (selector de área y filtros). */
export function Segmentos<T extends string>({ opciones, valor, onCambio, etiqueta, className }: {
  opciones: Array<{ valor: T; texto: string }>; valor: T; onCambio: (v: T) => void; etiqueta: string; className?: string;
}) {
  return (
    <div role="group" aria-label={etiqueta} className={cn('kds-chip-borde inline-flex flex-wrap gap-1 rounded-[24px] p-[5px]', className)}>
      {opciones.map((o) => (
        <button
          key={o.valor} type="button" aria-pressed={o.valor === valor} onClick={() => onCambio(o.valor)}
          className={cn(
            'h-11 whitespace-nowrap rounded-full px-[18px] text-[15px] font-semibold transition-colors duration-200 focus-visible:shadow-focus',
            o.valor === valor ? 'bg-surface text-primary' : 'text-kds-text-secondary hover:bg-[rgba(255,248,240,0.08)]',
          )}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
