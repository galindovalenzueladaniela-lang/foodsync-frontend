import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cerrarSesion, sesionGuardada } from '../../../services/sesionCocinaService';
import type { Personal } from '../../../services/types';

/* RF2: sesión del personal de cocina (Original Auth). */
interface SesionValue {
  personal: Personal | null;
  entrar: (p: Personal) => void;
  salir: () => Promise<void>;
}

const Ctx = createContext<SesionValue | null>(null);

export function SesionCocinaProvider({ children }: { children: ReactNode }) {
  const [personal, setPersonal] = useState<Personal | null>(() => sesionGuardada());
  const salir = useCallback(async () => {
    await cerrarSesion();
    setPersonal(null);
  }, []);
  const value = useMemo(() => ({ personal, entrar: setPersonal, salir }), [personal, salir]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSesion(): SesionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSesion debe usarse dentro de <SesionCocinaProvider>');
  return v;
}
