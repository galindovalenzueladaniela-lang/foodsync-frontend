import { api, espera, usaMocks } from './http';
import * as mock from './mock/cocinaStore';
import { PedidoSchema, type LineaPedido, type Pedido } from './types';

/** RF7: el comensal envía el pedido directo a cocina (S4 Pedidos publica PedidoCreado y el KDS lo recibe al instante). */
export async function crearPedido(mesaToken: string, lineas: LineaPedido[]): Promise<Pedido> {
  if (usaMocks) {
    await espera(400);
    return mock.crearPedidoCliente(mesaToken, lineas);
  }
  return api(`/cliente/mesas/${encodeURIComponent(mesaToken)}/pedidos`, PedidoSchema, {
    method: 'POST',
    body: JSON.stringify({ lineas }),
  });
}

/** Estado del pedido; en el mock lo cambia la cocina desde el KDS (otra pestaña). */
export async function obtenerPedido(id: string): Promise<Pedido> {
  if (usaMocks) {
    await espera(150);
    const p = mock.pedidoCliente(id);
    if (!p) throw new Error('Pedido no encontrado');
    return p;
  }
  return api(`/cliente/pedidos/${encodeURIComponent(id)}`, PedidoSchema);
}

/** Pedidos de la sesión de mesa: la cuenta suma todos (RF6). */
export async function pedidosDeMesa(mesaToken: string): Promise<Pedido[]> {
  if (usaMocks) {
    await espera(150);
    return mock.pedidosDeMesa(mesaToken);
  }
  return api(`/cliente/mesas/${encodeURIComponent(mesaToken)}/pedidos`, PedidoSchema.array());
}
