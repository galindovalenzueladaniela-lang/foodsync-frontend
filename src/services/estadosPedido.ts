import type { Area, Canal, EstadoPedido } from './types';

/* Un solo flujo de estados para cliente y cocina (RF7 y RF10). Cancelado queda fuera del avance. */
export const FLUJO_ESTADOS: EstadoPedido[] = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

/** Estado al que lleva el botón de la comanda; null cuando ya no avanza (entregado o cancelado). */
export function siguienteEstado(estado: EstadoPedido): EstadoPedido | null {
  const i = FLUJO_ESTADOS.indexOf(estado);
  return i >= 0 && i < FLUJO_ESTADOS.length - 1 ? FLUJO_ESTADOS[i + 1] : null;
}

/**
 * Estado que ve el comensal a partir de las comandas de su pedido (una por área):
 * entregado o listo cuando todas lo están; en preparación en cuanto un área empieza.
 * Las comandas canceladas no cuentan; si todas lo están, el pedido queda cancelado.
 */
export function estadoDelPedido(comandas: EstadoPedido[]): EstadoPedido {
  const niveles = comandas.filter((e) => e !== 'cancelado').map((e) => FLUJO_ESTADOS.indexOf(e));
  if (!niveles.length) return 'cancelado';
  const menor = Math.min(...niveles);
  if (menor >= 3) return 'entregado';
  if (menor >= 2) return 'listo';
  return Math.max(...niveles) >= 1 ? 'en_preparacion' : 'pendiente';
}

export const NOMBRE_AREA: Record<Area, string> = { caliente: 'Cocina caliente', fria: 'Cocina fría', barra: 'Barra' };
export const NOMBRE_CANAL: Record<Canal, string> = { qr: 'QR', mesero: 'Mesero', para_llevar: 'Para llevar' };
