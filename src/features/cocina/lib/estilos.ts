import type { EstadoPedido } from '../../../services/types';
import type { IconName } from '../../../shared/ui/Icon';
import type { TonoTiempo } from './tiempo';

/* "3 señales" del lienzo 14: columna, franja de color y etiqueta de texto dicen lo mismo. */
export const ESTILO_ESTADO: Record<EstadoPedido, {
  etiqueta: string; columna: string; vacio: string; franja: string; pill: string; punto: string; anilloPunto: string; anilloColumna: string; cantidad: string;
}> = {
  pendiente: {
    etiqueta: 'Pendiente', columna: 'Pendientes', vacio: 'Sin comandas pendientes', franja: 'border-t-status-pendiente',
    pill: 'bg-warning-soft text-warning-text', punto: 'bg-status-pendiente', cantidad: 'text-warning-text',
    anilloPunto: 'shadow-[0_0_0_3px_rgba(201,144,46,0.18)]', anilloColumna: 'shadow-[0_0_0_5px_rgba(201,144,46,0.25)]',
  },
  en_preparacion: {
    etiqueta: 'En preparación', columna: 'En preparación', vacio: 'Nada en preparación', franja: 'border-t-status-preparacion',
    pill: 'bg-paprika-soft text-paprika-text', punto: 'bg-status-preparacion', cantidad: 'text-paprika-text',
    anilloPunto: 'shadow-[0_0_0_3px_rgba(200,105,58,0.18)]', anilloColumna: 'shadow-[0_0_0_5px_rgba(200,105,58,0.25)]',
  },
  listo: {
    etiqueta: 'Listo para servir', columna: 'Listos', vacio: 'Nada esperando para servir', franja: 'border-t-status-listo',
    pill: 'bg-success-soft text-success-text', punto: 'bg-status-listo', cantidad: 'text-success-text',
    anilloPunto: 'shadow-[0_0_0_3px_rgba(93,140,102,0.2)]', anilloColumna: 'shadow-[0_0_0_5px_rgba(93,140,102,0.25)]',
  },
  entregado: {
    etiqueta: 'Entregado', columna: 'Entregados', vacio: 'Sin entregas', franja: 'border-t-status-entregado',
    pill: 'bg-neutral-soft text-neutral-text', punto: 'bg-status-entregado', cantidad: 'text-neutral-text', anilloPunto: '', anilloColumna: '',
  },
  cancelado: {
    etiqueta: 'Cancelado', columna: 'Cancelados', vacio: 'Sin cancelaciones', franja: 'border-t-status-cancelado',
    pill: 'bg-error-soft text-error-text', punto: 'bg-status-cancelado', cantidad: 'text-error-text', anilloPunto: '', anilloColumna: '',
  },
};

/** "2 pendientes", "1 en preparación", "3 listos". */
export function textoContador(estado: 'pendiente' | 'en_preparacion' | 'listo', n: number): string {
  if (estado === 'en_preparacion') return `${n} en preparación`;
  return `${n} ${estado === 'pendiente' ? 'pendiente' : 'listo'}${n === 1 ? '' : 's'}`;
}

/** Un solo botón grande por estado: Empezar preparación → Marcar como listo → Marcar entregado. */
export const ACCION: Partial<Record<EstadoPedido, { texto: string; icono: IconName; clase: string }>> = {
  pendiente: { texto: 'Empezar preparación', icono: 'cocina', clase: 'kds-btn-primario' },
  en_preparacion: { texto: 'Marcar como listo', icono: 'check', clase: 'kds-btn-listo' },
  listo: { texto: 'Marcar entregado', icono: 'check', clase: 'kds-btn-entregar' },
};

export const TONO_TIEMPO: Record<TonoTiempo, string> = {
  normal: 'bg-neutral-soft text-neutral-text',
  miel: 'bg-warning-soft text-warning-text',
  paprika: 'bg-paprika-soft text-paprika-text',
};
