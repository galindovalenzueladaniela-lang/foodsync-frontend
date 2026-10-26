import { useNavigate } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { Icon } from '../../../shared/ui/Icon';
import type { AvisoNuevoPedido as Aviso } from '../hooks/useCocina';

/** Aviso flotante "Nuevo pedido" (lienzo 14): aparece al llegar un pedido, abre la comanda y se puede cerrar. */
export function AvisoNuevoPedido({ aviso, onCerrar }: { aviso: Aviso | null; onCerrar: () => void }) {
  const navigate = useNavigate();
  return (
    <div aria-live="assertive" className="pointer-events-none absolute bottom-[92px] right-10 z-30 max-lg:bottom-6 max-lg:right-6">
      {aviso && (
        <div key={aviso.clave} className="floating aviso-entra pointer-events-auto relative flex w-[340px] items-center gap-3 overflow-hidden rounded-lg py-3.5 pl-4 pr-2 text-ink">
          <span aria-hidden="true" className="aviso-brillo pointer-events-none absolute inset-0" />
          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning-text">
            <span aria-hidden="true" className="aviso-pulso absolute inset-0 rounded-full" />
            <Icon name="notificaciones" size={20} className="aviso-campana block" />
          </span>
          <button
            type="button" onClick={() => { onCerrar(); navigate(rutasCocina.comanda(aviso.comandaId)); }}
            className="relative flex min-w-0 flex-1 flex-col text-left focus-visible:outline-none"
          >
            <span className="text-[15px] font-bold leading-5">{aviso.titulo}</span>
            <span className="text-[13px] leading-[18px] text-ink-secondary">{aviso.detalle}</span>
          </button>
          <button
            type="button" onClick={onCerrar} aria-label="Cerrar aviso"
            className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle focus-visible:shadow-focus"
          >
            <Icon name="cerrar" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
