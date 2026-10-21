import { useMemo } from 'react';

/* Ilustración de un código QR (decorativa). El QR real lo genera el panel de administración (RF5). */
const N = 21;

function patron(semilla: string): boolean[] {
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const celdas: boolean[] = [];
  for (let i = 0; i < N * N; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    celdas.push((h >>> 7) % 5 < 2);
  }
  const finder = (r0: number, c0: number) => {
    // Patrón de posición 7 × 7 con su margen blanco de un módulo.
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
      const dentro = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      const borde = r === 0 || r === 6 || c === 0 || c === 6;
      const centro = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      celdas[rr * N + cc] = dentro && (borde || centro);
    }
  };
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  return celdas;
}

export function QrGlyph({ semilla, size = 128 }: { semilla: string; size?: number }) {
  const celdas = useMemo(() => patron(semilla), [semilla]);
  const s = size / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {celdas.map((on, i) => on && <rect key={i} x={(i % N) * s} y={Math.floor(i / N) * s} width={s + 0.2} height={s + 0.2} fill="#2A201B" />)}
    </svg>
  );
}
