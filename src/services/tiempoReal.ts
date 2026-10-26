import { usaMocks } from './http';
import { suscribir as suscribirMock } from './mock/cocinaStore';
import { EventoTiempoRealSchema, type EventoTiempoReal } from './types';

/**
 * Eventos en vivo entre cliente y cocina (RF7, RF10).
 * - Sin backend: mock compartido entre pestañas (BroadcastChannel + localStorage).
 * - Con backend: Server-Sent Events en `${VITE_API_URL}/eventos` (un evento JSON por mensaje; ver README).
 *   Para pasar a WebSocket basta con cambiar esta función: las pantallas solo ven `suscribirTiempoReal`.
 */
export function suscribirTiempoReal(fn: (e: EventoTiempoReal) => void): () => void {
  if (usaMocks) return suscribirMock(fn);
  const fuente = new EventSource(`${import.meta.env.VITE_API_URL}/eventos`, { withCredentials: true });
  fuente.onmessage = (m) => {
    try {
      const r = EventoTiempoRealSchema.safeParse(JSON.parse(m.data));
      if (r.success) fn(r.data);
    } catch {
      /* mensaje que no es un evento conocido */
    }
  };
  return () => fuente.close();
}
