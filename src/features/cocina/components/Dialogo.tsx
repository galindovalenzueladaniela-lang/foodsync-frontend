import { useEffect, useId, useRef, type ReactNode } from 'react';

/** Ventana modal porcelana (confirmaciones de cocina). Se cierra con Esc o tocando fuera. */
export function Dialogo({ titulo, children, onCerrar }: { titulo: string; children: ReactNode; onCerrar: () => void }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('textarea, input, button')?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', tecla);
    return () => { window.removeEventListener('keydown', tecla); previo?.focus?.(); };
  }, [onCerrar]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,10,5,0.6)] p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={id} className="kds-tarjeta aviso-entra flex w-full max-w-[480px] flex-col gap-4 p-6 text-ink">
        <h2 id={id} className="display text-[32px] leading-9">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
