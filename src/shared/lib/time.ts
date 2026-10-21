/** Hora local HH:MM (24 h) de una fecha ISO. */
export function horaCorta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function minutosDesde(iso: string, ahora: number = Date.now()): number {
  return Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60_000));
}
