import { NOMBRE_AREA, NOMBRE_CANAL } from '../../../services/estadosPedido';
import type { Area, Canal, Comanda, EstadoPedido } from '../../../services/types';

/* Filtros del KDS: área (selector del navbar), estado (contadores) e historial del turno. */
export type FiltroArea = Area | 'todas';
export type EstadoTablero = 'pendiente' | 'en_preparacion' | 'listo';

export const ESTADOS_TABLERO: EstadoTablero[] = ['pendiente', 'en_preparacion', 'listo'];

export const esDeTablero = (e: EstadoPedido): e is EstadoTablero => (ESTADOS_TABLERO as EstadoPedido[]).includes(e);

export function filtrarPorArea(comandas: Comanda[], area: FiltroArea): Comanda[] {
  return area === 'todas' ? comandas : comandas.filter((c) => c.area === area);
}

/** Comandas de cada columna, la más reciente arriba (como en el lienzo 14). */
export function columnas(comandas: Comanda[], area: FiltroArea): Record<EstadoTablero, Comanda[]> {
  const r: Record<EstadoTablero, Comanda[]> = { pendiente: [], en_preparacion: [], listo: [] };
  for (const c of filtrarPorArea(comandas, area)) if (esDeTablero(c.estado)) r[c.estado].push(c);
  for (const k of ESTADOS_TABLERO) r[k].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  return r;
}

export function contarPorEstado(comandas: Comanda[], area: FiltroArea): Record<EstadoTablero, number> {
  const c = columnas(comandas, area);
  return { pendiente: c.pendiente.length, en_preparacion: c.en_preparacion.length, listo: c.listo.length };
}

/** Columnas que se ven: todas, o solo la del contador elegido. */
export function columnasVisibles(estado: EstadoTablero | null): EstadoTablero[] {
  return estado ? [estado] : ESTADOS_TABLERO;
}

/** Último momento en que la comanda llegó a un estado. */
export function momento(c: Comanda, estado: EstadoPedido): string | undefined {
  return [...c.historial].reverse().find((h) => h.estado === estado)?.en;
}

/** "Entregados hace poco": las últimas entregadas del área, la más reciente primero. */
export function entregadasRecientes(comandas: Comanda[], area: FiltroArea, cuantas = 5): Comanda[] {
  return filtrarPorArea(comandas, area)
    .filter((c) => c.estado === 'entregado')
    .sort((a, b) => (momento(b, 'entregado') ?? '').localeCompare(momento(a, 'entregado') ?? ''))
    .slice(0, cuantas);
}

export interface FiltroHistorial {
  texto: string;
  estado: EstadoPedido | 'todos';
  area: FiltroArea;
  canal: Canal | 'todos';
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Pedidos del turno: busca por mesa, número, plato, área o canal; lo más reciente primero. */
export function filtrarHistorial(comandas: Comanda[], f: FiltroHistorial): Comanda[] {
  const q = normalizar(f.texto.trim());
  return filtrarPorArea(comandas, f.area)
    .filter((c) => f.estado === 'todos' || c.estado === f.estado)
    .filter((c) => f.canal === 'todos' || c.canal === f.canal)
    .filter((c) => {
      if (!q) return true;
      const texto = [c.mesa, `#${c.numero}`, c.numero, NOMBRE_AREA[c.area], NOMBRE_CANAL[c.canal], ...c.lineas.map((l) => l.nombre)].join(' ');
      return normalizar(texto).includes(q);
    })
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}
