import { api, espera, usaMocks } from './http';
import { PedidoSchema, type LineaPedido, type Pedido } from './types';
import { pedidoDemo } from './mock/data';

const pedidosMock = new Map<string, Pedido>();
const getMock = (id: string) => {
  if (!pedidosMock.has(id) && id === 'ped_0418') pedidosMock.set(id, pedidoDemo());
  return pedidosMock.get(id);
};

/** RF7: el comensal envía el pedido directo a cocina (S4 Pedidos publica PedidoCreado). */
export async function crearPedido(mesaToken: string, lineas: LineaPedido[]): Promise<Pedido> {
  if (usaMocks) {
    await espera(400);
    const ahora = new Date().toISOString();
    const numero = String(419 + pedidosMock.size).padStart(4, '0');
    const pedido: Pedido = {
      id: `ped_${numero}`, numero, mesaToken, estado: 'pendiente', creadoEn: ahora,
      historial: [{ estado: 'pendiente', en: ahora }],
      lineas, total: lineas.reduce((s, l) => s + l.importe, 0),
    };
    pedidosMock.set(pedido.id, pedido);
    return pedido;
  }
  return api(`/cliente/mesas/${encodeURIComponent(mesaToken)}/pedidos`, PedidoSchema, {
    method: 'POST',
    body: JSON.stringify({ lineas }),
  });
}

export async function obtenerPedido(id: string): Promise<Pedido> {
  if (usaMocks) {
    await espera(150);
    const p = getMock(id);
    if (!p) throw new Error('Pedido no encontrado');
    return { ...p, historial: [...p.historial] };
  }
  return api(`/cliente/pedidos/${encodeURIComponent(id)}`, PedidoSchema);
}

/** Pedidos de la sesión de mesa: la cuenta suma todos (RF6). */
export async function pedidosDeMesa(mesaToken: string): Promise<Pedido[]> {
  if (usaMocks) {
    await espera(150);
    getMock('ped_0418');
    return [...pedidosMock.values()].filter((p) => p.mesaToken === mesaToken && p.estado !== 'cancelado');
  }
  return api(`/cliente/mesas/${encodeURIComponent(mesaToken)}/pedidos`, PedidoSchema.array());
}

/* En el mock el estado no avanza solo: lo cambiará la cocina cuando su prototipo esté conectado. */
