import { NOMBRE_AREA } from '../estadosPedido';
import type { Area, Canal, EstadoPedido, LineaPedido, NotificacionCocina, Personal } from '../types';
import { DEMO_TOKEN } from './data';

/* Datos de ejemplo del turno, tomados del lienzo 14 (Cocina · KDS). Solo se usan sin VITE_API_URL. */

export interface Registro { estado: EstadoPedido; en: string }

/** Pedido tal como lo guarda el mock: el historial de cada área es su comanda (el último registro es su estado). */
export interface PedidoGuardado {
  id: string;
  numero: string;
  mesaToken: string | null;
  mesa: string;
  canal: Canal;
  creadoEn: string;
  nota?: string;
  lineas: LineaPedido[];
  comandas: Partial<Record<Area, Registro[]>>;
  /** Estados del pedido completo, lo que ve el comensal. */
  historial: Registro[];
}

export interface EstadoMock {
  version: 1;
  sembradoEn: number;
  pedidos: PedidoGuardado[];
  notificaciones: NotificacionCocina[];
}

const equipo = ['Sofía', 'Diego', 'Mateo'];
const turno = { nombre: 'Turno de noche', horario: '18:00 a 02:00', equipo };

/** RF2: cuentas de prueba de Original Auth mientras no haya backend. */
export const personalDemo: Personal[] = [
  { id: 'per_sofia', nombre: 'Sofía Ramírez', correo: 'sofia@casaolivo.mx', rol: 'Jefa de cocina', area: 'todas', turno },
  { id: 'per_diego', nombre: 'Diego Hernández', correo: 'diego@casaolivo.mx', rol: 'Cocinero de línea', area: 'caliente', turno },
  { id: 'per_mateo', nombre: 'Mateo López', correo: 'mateo@casaolivo.mx', rol: 'Barra', area: 'barra', turno },
];

type Linea = [cantidad: number, nombre: string, area: Area, precio: number, detalle?: string, observaciones?: string];

interface Semilla {
  numero: string;
  mesa: string;
  canal: Canal;
  token?: string;
  /** Minutos desde que se pidió. */
  hace: number;
  /** Minutos (desde el pedido) en que pasó a cada estado. */
  pasos: Partial<Record<EstadoPedido, number>>;
  lineas: Linea[];
  nota?: (creado: number) => string;
}

const hora = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const SEMILLAS: Semilla[] = [
  { numero: '0410', mesa: 'Mesa 12', canal: 'mesero', hace: 78, pasos: { en_preparacion: 3, listo: 24, entregado: 27 }, lineas: [[2, 'Pesca del día', 'caliente', 245, 'Puré de coliflor']] },
  { numero: '0412', mesa: 'Mesa 2', canal: 'qr', hace: 64, pasos: { en_preparacion: 2, listo: 14, entregado: 18 }, lineas: [[1, 'Burrata con tomates asados', 'fria', 165]] },
  { numero: '0413', mesa: 'Mesa 3', canal: 'qr', hace: 58, pasos: { en_preparacion: 4, listo: 22, entregado: 25 }, lineas: [[2, 'Risotto de hongos', 'caliente', 185, 'Porción individual']] },
  { numero: '0414', mesa: 'Para llevar', canal: 'para_llevar', hace: 52, pasos: { en_preparacion: 3, listo: 15, entregado: 20 }, lineas: [[2, 'Tarta de queso', 'fria', 95]] },
  { numero: '0415', mesa: 'Mesa 1', canal: 'qr', hace: 21, pasos: { en_preparacion: 2, listo: 14 }, lineas: [[1, 'Tarta de queso', 'fria', 95, '', 'Con vela: cumpleaños']] },
  { numero: '0416', mesa: 'Mesa 11', canal: 'mesero', hace: 24, pasos: { en_preparacion: 3 }, lineas: [[6, 'Menú degustación', 'caliente', 690]] },
  { numero: '0417', mesa: 'Mesa 4', canal: 'mesero', hace: 16, pasos: { en_preparacion: 2, listo: 13 }, lineas: [[1, 'Burrata con tomates asados', 'fria', 165], [1, 'Croquetas de la casa', 'fria', 120]] },
  {
    numero: '0418', mesa: 'Mesa 7', canal: 'qr', token: DEMO_TOKEN, hace: 12, pasos: { en_preparacion: 3 },
    lineas: [[2, 'Risotto de hongos', 'caliente', 210, 'Porción individual · Parmesano extra', 'Sin cebolla en un risotto'], [1, 'Pesca del día', 'caliente', 245, 'Puré de coliflor']],
  },
  { numero: '0419', mesa: 'Mesa 5', canal: 'mesero', hace: 6, pasos: { en_preparacion: 2 }, lineas: [[2, 'Limonada de hierbabuena', 'barra', 45], [1, 'Agua mineral', 'barra', 40]] },
  { numero: '0420', mesa: 'Para llevar', canal: 'para_llevar', hace: 4, pasos: {}, lineas: [[2, 'Burrata con tomates asados', 'fria', 165]], nota: (creado) => `Recogen a las ${hora(creado + 30 * 60_000)}` },
  { numero: '0421', mesa: 'Mesa 10', canal: 'qr', hace: 1, pasos: {}, lineas: [[1, 'Pan de masa madre', 'caliente', 70], [1, 'Crema de ahuyama', 'caliente', 115]] },
];

/** Turno de ejemplo con las comandas del diseño, con tiempos relativos a `ahora`. */
export function sembrar(ahora: number): EstadoMock {
  const iso = (ms: number) => new Date(ms).toISOString();
  const pedidos = SEMILLAS.map((s): PedidoGuardado => {
    // Unos segundos de más para que el minuto ya se vea cumplido al abrir.
    const creado = ahora - s.hace * 60_000 - 20_000;
    const historial: Registro[] = [{ estado: 'pendiente', en: iso(creado) }];
    for (const estado of ['en_preparacion', 'listo', 'entregado'] as const) {
      const min = s.pasos[estado];
      if (min !== undefined) historial.push({ estado, en: iso(creado + min * 60_000) });
    }
    const lineas: LineaPedido[] = s.lineas.map(([cantidad, nombre, area, precio, detalle = '', observaciones = '']) => ({
      productoId: nombre.toLowerCase().replace(/[^a-z]+/g, '-'), nombre, cantidad, extrasIds: [], detalle, observaciones, importe: precio * cantidad, area,
    }));
    const areas = [...new Set(lineas.map((l) => l.area!))];
    return {
      id: `ped_${s.numero}`, numero: s.numero, mesaToken: s.token ?? null, mesa: s.mesa, canal: s.canal, creadoEn: iso(creado),
      nota: s.nota?.(creado), lineas, comandas: Object.fromEntries(areas.map((a) => [a, historial.map((r) => ({ ...r }))])), historial,
    };
  });
  const nuevo = (numero: string, leida: boolean): NotificacionCocina => {
    const p = pedidos.find((x) => x.numero === numero)!;
    const area = p.lineas[0].area!;
    return {
      id: `nuevo-${p.id}`, tipo: 'nuevo_pedido', titulo: `Nuevo pedido · ${p.mesa}`,
      detalle: `Llegó por ${p.canal === 'qr' ? 'QR' : p.canal === 'mesero' ? 'el mesero' : 'pedido para llevar'} · ${NOMBRE_AREA[area]}`,
      comandaId: `${p.id}-${area}`, en: p.creadoEn, leida,
    };
  };
  return { version: 1, sembradoEn: ahora, pedidos, notificaciones: [nuevo('0421', false), nuevo('0420', true), nuevo('0419', true)] };
}
