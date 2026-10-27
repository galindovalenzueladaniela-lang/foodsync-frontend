import { useEffect, useState } from 'react';
import { obtenerPedido } from '../../../services/pedidoService';
import { suscribirTiempoReal } from '../../../services/tiempoReal';
import type { Pedido } from '../../../services/types';

/**
 * Estado del pedido en tiempo real (RF7): se recarga en cuanto la cocina cambia una de sus comandas
 * (canal de src/services/tiempoReal) y, por si se pierde un evento, también cada `intervaloMs`.
 */
export function usePedido(id: string, intervaloMs = 10_000) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let vivo = true;
    const cargar = () => obtenerPedido(id).then((p) => vivo && setPedido(p)).catch(() => vivo && setError(true));
    cargar();
    const t = intervaloMs > 0 ? setInterval(cargar, intervaloMs) : undefined;
    const dejar = suscribirTiempoReal((e) => { if ('pedidoId' in e && e.pedidoId === id) cargar(); });
    return () => { vivo = false; if (t) clearInterval(t); dejar(); };
  }, [id, intervaloMs]);
  return { pedido, error };
}

/** Reloj que se actualiza cada minuto (para "Lleva 12 minutos"). */
export function useAhora(cadaMs = 30_000) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);
  return ahora;
}
