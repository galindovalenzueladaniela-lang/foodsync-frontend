import { z } from 'zod';
import { api, espera, usaMocks } from './http';
import * as mock from './mock/cocinaStore';
import { ComandaSchema, NotificacionCocinaSchema, type Comanda, type EstadoPedido, type NotificacionCocina } from './types';

/* RF10 · KDS: comandas por área, cambio de estado, cancelación de platillos y avisos de cocina. */

export async function listarComandas(): Promise<Comanda[]> {
  if (usaMocks) {
    await espera(200);
    return mock.comandas();
  }
  return api('/cocina/comandas', z.array(ComandaSchema));
}

export async function obtenerComanda(id: string): Promise<Comanda> {
  if (usaMocks) {
    await espera(150);
    return mock.comanda(id);
  }
  return api(`/cocina/comandas/${encodeURIComponent(id)}`, ComandaSchema);
}

/** Empezar preparación → marcar como listo → marcar entregado. El pedido del comensal se actualiza solo. */
export async function cambiarEstadoComanda(id: string, estado: EstadoPedido): Promise<Comanda> {
  if (usaMocks) {
    await espera(120);
    return mock.cambiarEstadoComanda(id, estado);
  }
  return api(`/cocina/comandas/${encodeURIComponent(id)}`, ComandaSchema, { method: 'PATCH', body: JSON.stringify({ estado }) });
}

/** Cancela un platillo por falta de ingredientes; el backend avisa al mesero y al administrador. */
export async function cancelarPlatillo(comandaId: string, indice: number, motivo: string): Promise<Comanda> {
  if (usaMocks) {
    await espera(200);
    return mock.cancelarLinea(comandaId, indice, motivo);
  }
  return api(`/cocina/comandas/${encodeURIComponent(comandaId)}/lineas/${indice}/cancelar`, ComandaSchema, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

export async function listarNotificaciones(): Promise<NotificacionCocina[]> {
  if (usaMocks) {
    await espera(150);
    // En el mock los retrasos se calculan aquí; con backend los genera el servidor.
    mock.registrarRetrasos();
    return mock.notificaciones();
  }
  return api('/cocina/notificaciones', z.array(NotificacionCocinaSchema));
}

export async function marcarNotificacionesLeidas(ids: string[] | 'todas'): Promise<void> {
  if (usaMocks) {
    await espera(80);
    mock.marcarLeidas(ids);
    return;
  }
  await fetch(`${import.meta.env.VITE_API_URL}/cocina/notificaciones/leidas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

/** Revisa retrasos (solo en el mock; el backend los detecta por su cuenta). */
export function revisarRetrasos() {
  if (usaMocks) mock.registrarRetrasos();
}
