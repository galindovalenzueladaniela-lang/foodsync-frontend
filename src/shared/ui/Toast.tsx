import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

interface Aviso { id: number; texto: string; icon: IconName }
const Ctx = createContext<(texto: string, icon?: IconName) => void>(() => {});

/** Avisos breves en la parte superior (p. ej. "Avisamos al personal"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const seq = useRef(0);
  const mostrar = useCallback((texto: string, icon: IconName = 'check') => {
    const id = ++seq.current;
    setAvisos((a) => [...a, { id, texto, icon }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
        {avisos.map((a) => (
          <div key={a.id} className="floating flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-soft text-success-text"><Icon name={a.icon} size={16} /></span>
            {a.texto}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
