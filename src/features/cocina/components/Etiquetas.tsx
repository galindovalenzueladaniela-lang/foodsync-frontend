import type { EstadoPedido } from '../../../services/types';
import { Icon } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { ESTILO_ESTADO, TONO_TIEMPO } from '../lib/estilos';
import { textoMinutos, tonoTiempo } from '../lib/tiempo';

/** Etiqueta de estado (segunda señal, además de la columna y la franja). */
export function EtiquetaEstado({ estado, className }: { estado: EstadoPedido; className?: string }) {
  const e = ESTILO_ESTADO[estado];
  return (
    <span className={cn('inline-flex h-[26px] items-center gap-[7px] whitespace-nowrap rounded-full pl-[9px] pr-[11px] text-xs font-semibold tracking-[0.01em]', e.pill, className)}>
      <span aria-hidden="true" className={cn('h-[7px] w-[7px] shrink-0 rounded-full', e.punto, e.anilloPunto)} />
      {e.etiqueta}
    </span>
  );
}

/** Tiempo transcurrido: miel desde los 15 minutos y paprika desde los 25. */
export function TiempoChip({ minutos, className }: { minutos: number; className?: string }) {
  const tono = tonoTiempo(minutos);
  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-base font-bold leading-5 tabular-nums', TONO_TIEMPO[tono], className)}
      title={tono === 'normal' ? 'Tiempo transcurrido' : tono === 'miel' ? 'Lleva 15 minutos o más' : 'Lleva 25 minutos o más'}
    >
      <Icon name="reloj" size={16} strokeWidth={2} />
      {textoMinutos(minutos)}
    </span>
  );
}

/** Caja miel con las observaciones de la comanda. */
export function NotaCocina({ notas, className }: { notas: string[]; className?: string }) {
  if (!notas.length) return null;
  return (
    <div className={cn('flex gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-[15px] font-semibold leading-5 text-kds-nota', className)}>
      <Icon name="alerta" size={18} strokeWidth={2} className="mt-px block shrink-0" />
      <div className="flex flex-col gap-1">{notas.map((n) => <span key={n}>{n}</span>)}</div>
    </div>
  );
}
