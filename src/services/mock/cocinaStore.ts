import { NOMBRE_AREA, NOMBRE_CANAL, estadoDelPedido } from '../estadosPedido';
import type { Area, Comanda, EstadoPedido, EventoTiempoReal, LineaPedido, NotificacionCocina, Pedido } from '../types';
import { mesaDemo } from './data';
import { sembrar, type EstadoMock, type PedidoGuardado, type Registro } from './cocinaSemilla';

/*
 * Backend simulado compartido entre pestañas del mismo navegador (cliente y cocina).
 * El estado vive en localStorage y cada cambio se avisa por BroadcastChannel, igual que lo hará
 * el canal real (SSE o WebSocket). Solo lo usan los servicios cuando no hay VITE_API_URL.
 */

const CLAVE = 'foodsync.mock.cocina';
const NOMBRE_CANAL_BC = 'foodsync-tiempo-real';
/** Los datos de ejemplo duran un turno; después se vuelven a sembrar. */
const VIGENCIA_MS = 10 * 60 * 60_000;
/** RF10: a partir de estos minutos sin estar listo, la comanda avisa retraso. */
export const MINUTOS_RETRASO = 25;

let memoria: EstadoMock | null = null;

function almacen(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function leer(): EstadoMock {
  const ls = almacen();
  let estado: EstadoMock | null = memoria;
  if (ls) {
    try {
      const raw = ls.getItem(CLAVE);
      estado = raw ? (JSON.parse(raw) as EstadoMock) : null;
    } catch {
      estado = null;
    }
  }
  if (!estado || estado.version !== 1 || Date.now() - estado.sembradoEn > VIGENCIA_MS) {
    estado = sembrar(Date.now());
    guardar(estado);
  }
  return estado;
}

function guardar(estado: EstadoMock) {
  memoria = estado;
  try {
    almacen()?.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    /* sin almacenamiento: queda en memoria de esta pestaña */
  }
}

/** Vuelve a sembrar el turno de ejemplo (pruebas). */
export function reiniciar(ahora = Date.now()) {
  guardar(sembrar(ahora));
}

/* ---------- Eventos ---------- */

type Oyente = (e: EventoTiempoReal) => void;
const oyentes = new Set<Oyente>();
let canal: BroadcastChannel | null | undefined;

function abrirCanal() {
  if (canal !== undefined) return canal;
  try {
    canal = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(NOMBRE_CANAL_BC);
  } catch {
    canal = null;
  }
  if (canal) {
    (canal as unknown as { unref?: () => void }).unref?.();
    canal.onmessage = (m: MessageEvent<EventoTiempoReal>) => oyentes.forEach((f) => f(m.data));
  }
  return canal;
}

export function suscribir(fn: Oyente): () => void {
  abrirCanal();
  oyentes.add(fn);
  return () => { oyentes.delete(fn); };
}

function emitir(e: EventoTiempoReal) {
  oyentes.forEach((f) => f(e));
  abrirCanal()?.postMessage(e);
}

/* ---------- Vistas ---------- */

const actual = (h: Registro[]) => h[h.length - 1].estado;
const ahoraIso = () => new Date().toISOString();
const idComanda = (p: PedidoGuardado, area: Area) => `${p.id}-${area}`;

function comandaDe(p: PedidoGuardado, area: Area): Comanda {
  const historial = p.comandas[area]!;
  return {
    id: idComanda(p, area), pedidoId: p.id, numero: p.numero, mesa: p.mesa, canal: p.canal, area,
    estado: actual(historial), creadoEn: p.creadoEn, historial: historial.map((r) => ({ ...r })), nota: p.nota,
    lineas: p.lineas
      .map((l, indice) => ({ l, indice }))
      .filter(({ l }) => (l.area ?? 'caliente') === area)
      .map(({ l, indice }) => ({ indice, nombre: l.nombre, cantidad: l.cantidad, detalle: l.detalle, observaciones: l.observaciones, cancelada: l.cancelada })),
  };
}

function pedidoDe(p: PedidoGuardado): Pedido {
  return {
    id: p.id, numero: p.numero, mesaToken: p.mesaToken ?? '', estado: actual(p.historial), creadoEn: p.creadoEn,
    historial: p.historial.map((r) => ({ ...r })), lineas: p.lineas.map((l) => ({ ...l })),
    // Lo cancelado en cocina no se cobra.
    total: p.lineas.filter((l) => !l.cancelada).reduce((s, l) => s + l.importe, 0),
  };
}

function buscarComanda(e: EstadoMock, id: string) {
  for (const p of e.pedidos) {
    for (const area of Object.keys(p.comandas) as Area[]) if (idComanda(p, area) === id) return { p, area };
  }
  throw new Error('Comanda no encontrada');
}

/** El pedido del comensal sigue a sus comandas. */
function sincronizarPedido(p: PedidoGuardado, en: string) {
  const nuevo = estadoDelPedido(Object.values(p.comandas).map((h) => actual(h!)));
  if (nuevo !== actual(p.historial)) p.historial.push({ estado: nuevo, en });
}

/* ---------- Cliente ---------- */

export function crearPedidoCliente(mesaToken: string, lineas: LineaPedido[]): Pedido {
  const e = leer();
  const en = ahoraIso();
  const numero = String(Math.max(0, ...e.pedidos.map((p) => Number(p.numero))) + 1).padStart(4, '0');
  const conArea = lineas.map((l) => ({ ...l, area: l.area ?? 'caliente' }));
  const areas = [...new Set(conArea.map((l) => l.area))];
  const p: PedidoGuardado = {
    id: `ped_${numero}`, numero, mesaToken, mesa: mesaToken === mesaDemo.token ? `Mesa ${mesaDemo.mesa.numero}` : 'Mesa', canal: 'qr',
    creadoEn: en, lineas: conArea, comandas: Object.fromEntries(areas.map((a) => [a, [{ estado: 'pendiente', en }]])),
    historial: [{ estado: 'pendiente', en }],
  };
  e.pedidos.push(p);
  e.notificaciones.unshift({
    id: `nuevo-${p.id}`, tipo: 'nuevo_pedido', titulo: `Nuevo pedido · ${p.mesa}`,
    detalle: `Llegó por ${NOMBRE_CANAL[p.canal]} · ${areas.map((a) => NOMBRE_AREA[a]).join(', ')}`,
    comandaId: idComanda(p, areas[0]), en, leida: false,
  });
  guardar(e);
  emitir({ tipo: 'pedido.creado', pedidoId: p.id, comandaIds: areas.map((a) => idComanda(p, a)) });
  return pedidoDe(p);
}

export function pedidoCliente(id: string): Pedido | null {
  const p = leer().pedidos.find((x) => x.id === id);
  return p ? pedidoDe(p) : null;
}

export function pedidosDeMesa(mesaToken: string): Pedido[] {
  return leer().pedidos.filter((p) => p.mesaToken === mesaToken).map(pedidoDe).filter((p) => p.estado !== 'cancelado');
}

/* ---------- Cocina ---------- */

export function comandas(): Comanda[] {
  return leer().pedidos.flatMap((p) => (Object.keys(p.comandas) as Area[]).map((a) => comandaDe(p, a)));
}

export function comanda(id: string): Comanda {
  const { p, area } = buscarComanda(leer(), id);
  return comandaDe(p, area);
}

export function cambiarEstadoComanda(id: string, estado: EstadoPedido): Comanda {
  const e = leer();
  const { p, area } = buscarComanda(e, id);
  const historial = p.comandas[area]!;
  if (actual(historial) !== estado) {
    const en = ahoraIso();
    historial.push({ estado, en });
    sincronizarPedido(p, en);
    guardar(e);
    emitir({ tipo: 'comanda.actualizada', pedidoId: p.id, comandaId: id, estado });
  }
  return comandaDe(p, area);
}

/** RF10: cancela un platillo (p. ej. por falta de ingredientes) y avisa al mesero y al administrador. */
export function cancelarLinea(comandaId: string, indice: number, motivo: string): Comanda {
  const e = leer();
  const { p, area } = buscarComanda(e, comandaId);
  const linea = p.lineas[indice];
  if (!linea || (linea.area ?? 'caliente') !== area) throw new Error('Platillo no encontrado');
  if (!linea.cancelada) {
    const en = ahoraIso();
    linea.cancelada = { motivo, en };
    if (p.lineas.filter((l) => (l.area ?? 'caliente') === area).every((l) => l.cancelada)) p.comandas[area]!.push({ estado: 'cancelado', en });
    sincronizarPedido(p, en);
    e.notificaciones.unshift({
      id: `cancelado-${comandaId}-${indice}`, tipo: 'cancelacion', titulo: `Platillo cancelado · ${p.mesa}`,
      detalle: `${linea.cantidad}× ${linea.nombre} · ${motivo}`, comandaId, en, leida: false,
    });
    guardar(e);
    emitir({ tipo: 'platillo.cancelado', pedidoId: p.id, comandaId, linea: indice, motivo });
  }
  return comandaDe(p, area);
}

export function notificaciones(): NotificacionCocina[] {
  return [...leer().notificaciones].sort((a, b) => b.en.localeCompare(a.en));
}

export function marcarLeidas(ids: string[] | 'todas') {
  const e = leer();
  let cambio = false;
  for (const n of e.notificaciones) {
    if (!n.leida && (ids === 'todas' || ids.includes(n.id))) {
      n.leida = true;
      cambio = true;
    }
  }
  if (cambio) {
    guardar(e);
    emitir({ tipo: 'notificaciones.actualizadas' });
  }
}

/** Crea un aviso de retraso por cada comanda que pasó de MINUTOS_RETRASO sin estar lista (una sola vez). */
export function registrarRetrasos(ahora = Date.now()): number {
  const e = leer();
  let nuevas = 0;
  for (const p of e.pedidos) {
    for (const area of Object.keys(p.comandas) as Area[]) {
      const estado = actual(p.comandas[area]!);
      const min = Math.floor((ahora - new Date(p.creadoEn).getTime()) / 60_000);
      const id = `retraso-${idComanda(p, area)}`;
      if ((estado === 'pendiente' || estado === 'en_preparacion') && min >= MINUTOS_RETRASO && !e.notificaciones.some((n) => n.id === id)) {
        e.notificaciones.unshift({
          id, tipo: 'retraso', titulo: `Retraso · ${p.mesa}`,
          detalle: `#${p.numero} · ${NOMBRE_AREA[area]} · lleva ${min} min ${estado === 'pendiente' ? 'sin empezar' : 'en preparación'}`,
          comandaId: idComanda(p, area), en: new Date(ahora).toISOString(), leida: false,
        });
        nuevas++;
      }
    }
  }
  if (nuevas) {
    guardar(e);
    emitir({ tipo: 'notificaciones.actualizadas' });
  }
  return nuevas;
}
