import type { Producto } from '../../../services/types';

export interface Seleccion {
  varianteId?: string;
  extrasIds: string[];
}

/** Precio unitario = base + variante + extras (RF4). */
export function precioUnitario(p: Producto, { varianteId, extrasIds }: Seleccion): number {
  const variante = p.variantes.find((v) => v.id === varianteId)?.precioExtra ?? 0;
  const extras = p.extras.filter((e) => extrasIds.includes(e.id)).reduce((s, e) => s + e.precioExtra, 0);
  return p.precio + variante + extras;
}

/** "Porción individual · Parmesano extra" */
export function detalleSeleccion(p: Producto, { varianteId, extrasIds }: Seleccion): string {
  const partes: string[] = [];
  const v = p.variantes.find((x) => x.id === varianteId);
  if (v) partes.push(v.nombre);
  for (const e of p.extras) if (extrasIds.includes(e.id)) partes.push(e.nombre);
  return partes.join(' · ');
}
