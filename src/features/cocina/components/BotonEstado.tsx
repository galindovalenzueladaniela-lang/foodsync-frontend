import { useState } from 'react';
import type { Comanda } from '../../../services/types';
import { Icon } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { ACCION } from '../lib/estilos';

/** El botón grande (56 px) que mueve la comanda al siguiente estado. Se toca con guantes o con prisa. */
export function BotonEstado({ comanda, onAvanzar, className }: { comanda: Comanda; onAvanzar: (c: Comanda) => Promise<void>; className?: string }) {
  const accion = ACCION[comanda.estado];
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  if (!accion) return null;
  const tocar = async () => {
    setEnviando(true);
    setError(false);
    try {
      await onAvanzar(comanda);
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <button
        type="button" onClick={tocar} disabled={enviando}
        className={cn(
          'flex h-14 w-full items-center justify-center gap-2.5 rounded-md text-lg font-bold leading-[22px] transition-transform duration-100 active:translate-y-px disabled:opacity-60 focus-visible:shadow-focus',
          accion.clase,
        )}
      >
        <Icon name={accion.icono} size={22} strokeWidth={2} />
        {enviando ? 'Guardando…' : accion.texto}
      </button>
      {error && <p role="alert" className="text-center text-xs font-semibold text-error-text">No se pudo guardar. Toca de nuevo.</p>}
    </div>
  );
}
