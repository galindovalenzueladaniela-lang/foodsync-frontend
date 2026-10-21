import { useEffect, useRef } from 'react';
import type { EstadoPedido } from '../../../services/types';

/**
 * Aviso dentro de la app cuando la cocina cambia el estado del pedido (RF7).
 * La notificación de la pantalla se vuelve a animar sola (se monta de nuevo con `key = estado`);
 * aquí se hace vibrar el teléfono para que el comensal lo note aunque no esté mirando.
 * La primera carga no avisa: solo los cambios mientras la pantalla está abierta.
 */
export function useAvisoEstado(estado: EstadoPedido | undefined) {
  const anterior = useRef(estado);
  useEffect(() => {
    if (!estado) return;
    const antes = anterior.current;
    anterior.current = estado;
    if (antes && antes !== estado) navigator.vibrate?.([70, 50, 70]);
  }, [estado]);
}
