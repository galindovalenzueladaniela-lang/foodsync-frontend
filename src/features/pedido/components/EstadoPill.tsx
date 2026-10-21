import type { EstadoPedido } from '../../../services/types';
import { cn } from '../../../shared/lib/cn';

/* Status del sistema (pedido). Los nombres son los del componente Status del lienzo FoodSync. */
export const ESTADOS: Record<EstadoPedido, { label: string; pill: string; dot: string }> = {
  pendiente: { label: 'Pendiente', pill: 'bg-warning-soft text-warning-text', dot: 'bg-status-pendiente' },
  en_preparacion: { label: 'En preparación', pill: 'bg-[#F7E4D8] text-[#9A4A24]', dot: 'bg-status-preparacion' },
  listo: { label: 'Listo', pill: 'bg-success-soft text-success-text', dot: 'bg-status-listo' },
  entregado: { label: 'Entregado', pill: 'bg-[#EFE8DF] text-[#6B5E54]', dot: 'bg-status-entregado' },
  cancelado: { label: 'Cancelado', pill: 'bg-error-soft text-error-text', dot: 'bg-status-cancelado' },
};

export function EstadoPill({ estado }: { estado: EstadoPedido }) {
  const e = ESTADOS[estado];
  return (
    <span className={cn('inline-flex h-[22px] items-center gap-[7px] rounded-full pl-[9px] pr-[11px] text-xs font-semibold', e.pill)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', e.dot)} aria-hidden="true" />
      {e.label}
    </span>
  );
}
