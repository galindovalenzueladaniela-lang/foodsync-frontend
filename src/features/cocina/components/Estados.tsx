import type { ReactNode } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';

/* Estados de carga, error y vacío de las pantallas de cocina (sobre el fondo espresso). */

export function Cargando({ texto, className }: { texto: string; className?: string }) {
  return (
    <div role="status" className={cn('flex flex-col gap-3', className)}>
      <span className="sr-only">{texto}</span>
      {[0, 1, 2].map((i) => <div key={i} aria-hidden="true" className="kds-tarjeta h-20 animate-pulse opacity-40" />)}
    </div>
  );
}

export function ErrorCarga({ titulo, detalle, onReintentar, className }: { titulo: string; detalle: string; onReintentar: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('kds-panel flex flex-col items-center gap-3 rounded-xl px-6 py-12 text-center', className)}>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-soft text-error-text"><Icon name="alerta" size={24} strokeWidth={2} /></span>
      <h2 className="font-sans text-xl font-bold">{titulo}</h2>
      <p className="max-w-md text-[15px] text-kds-text-secondary">{detalle}</p>
      <Button onClick={onReintentar} className="mt-2 !h-14 !px-6 !text-base">Reintentar</Button>
    </div>
  );
}

export function Vacio({ icono, titulo, detalle, children, className }: { icono: IconName; titulo: string; detalle: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('kds-panel flex flex-col items-center gap-3 rounded-xl px-6 py-12 text-center', className)}>
      <span className="kds-chip inline-flex h-12 w-12 items-center justify-center rounded-full text-kds-text-secondary"><Icon name={icono} size={24} /></span>
      <h2 className="font-sans text-xl font-bold">{titulo}</h2>
      <p className="max-w-md text-[15px] text-kds-text-secondary">{detalle}</p>
      {children}
    </div>
  );
}
