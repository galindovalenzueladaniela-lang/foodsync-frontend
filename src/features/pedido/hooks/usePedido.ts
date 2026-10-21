import { useEffect, useState } from 'react';
import { obtenerPedido } from '../../../services/pedidoService';
import type { Pedido } from '../../../services/types';

/**
 * Estado del pedido "en tiempo real" (RF7). Por ahora consulta cada `intervaloMs`;
 * cuando el Gateway exponga un canal push (SSE o WebSocket alimentado por RabbitMQ) basta con cambiar este hook.
 */
export function usePedido(id: string, intervaloMs = 10_000) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let vivo = true;
    const cargar = () => obtenerPedido(id).then((p) => vivo && setPedido(p)).catch(() => vivo && setError(true));
    cargar();
    const t = intervaloMs > 0 ? setInterval(cargar, intervaloMs) : undefined;
    return () => { vivo = false; if (t) clearInterval(t); };
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
