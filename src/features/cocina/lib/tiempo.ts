/* Tiempo transcurrido de una comanda (RF10): pasa a miel a los 15 minutos y a paprika a los 25. */
export const MINUTOS_MIEL = 15;
export const MINUTOS_PAPRIKA = 25;

export type TonoTiempo = 'normal' | 'miel' | 'paprika';

export function minutosDesde(iso: string, ahora: number): number {
  return Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60_000));
}

export function tonoTiempo(minutos: number): TonoTiempo {
  if (minutos >= MINUTOS_PAPRIKA) return 'paprika';
  if (minutos >= MINUTOS_MIEL) return 'miel';
  return 'normal';
}

/** La comanda cambió de estado hace unos segundos (se anima su llegada a la nueva columna). */
export function cambioReciente(historial: Array<{ en: string }>, ahora: number, ms = 4_000): boolean {
  const ultimo = historial[historial.length - 1];
  return !!ultimo && ahora - new Date(ultimo.en).getTime() < ms;
}

/** "12 min" · "1 h 05 min" */
export function textoMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, '0')} min`;
}

/** Hora local HH:MM. */
export function horaLocal(ms: number | string): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
