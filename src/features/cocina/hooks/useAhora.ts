import { useEffect, useState } from 'react';

/** Hora actual que se renueva sola: los minutos de las comandas y el reloj avanzan sin recargar. */
export function useAhora(cadaMs = 15_000) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);
  return ahora;
}
