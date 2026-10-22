import { useEffect, useState } from 'react';
import { Screen } from '../../../shared/layout/Screen';
import { AnimatedCheck } from '../../../shared/ui/AnimatedCheck';
import { Button } from '../../../shared/ui/Button';
import { useToast } from '../../../shared/ui/Toast';
import { comprobanteComoImagen, type Comprobante } from '../lib/comprobante';

/* Pago confirmado (Original Pay): palomita animada y el comprobante, que sale "impreso" como ticket.
   Se puede guardar como imagen: en el teléfono abre la hoja de compartir (Guardar imagen); si no, se descarga. */
export function PagoConfirmado({ comprobante: c, onVolver }: { comprobante: Comprobante; onVolver: () => void }) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const avisar = useToast();

  // La imagen se prepara antes del toque: el teléfono solo abre "Compartir" dentro del gesto del usuario.
  useEffect(() => {
    let vivo = true;
    comprobanteComoImagen(c).then((f) => vivo && setArchivo(f)).catch(() => {});
    return () => { vivo = false; };
  }, [c]);

  const descargar = async () => {
    if (!archivo) return;
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: 'Comprobante de pago' });
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(archivo);
    const a = document.createElement('a');
    a.href = url;
    a.download = archivo.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    avisar('Comprobante descargado');
  };

  return (
    <Screen
      className="items-center gap-5 px-5 pt-12 text-center"
      footer={
        <div className="flex flex-col gap-1">
          <Button block onClick={descargar} disabled={!archivo}>Descargar comprobante</Button>
          <Button block variant="ghost" onClick={onVolver}>Volver al menú</Button>
        </div>
      }
    >
      <AnimatedCheck size={96} className="mt-2" />
      <div className="flex flex-col gap-2 pt-3">
        <h1 className="display text-[40px] leading-[42px]">¡Pago <em className="text-primary">confirmado!</em></h1>
        <p className="text-[15px] leading-[22px] text-ink-secondary">Gracias por venir. Tu comprobante está aquí abajo;<br />descárgalo para guardarlo.</p>
      </div>

      <div className="recibo-imprime w-full [filter:drop-shadow(0_10px_18px_rgba(74,45,30,0.14))]">
        <section aria-label="Comprobante de pago" className="recibo-borde flex flex-col gap-2.5 bg-surface px-[22px] pb-7 pt-5 text-left">
          <span className="text-[11px] font-semibold uppercase leading-4 tracking-caption text-ink-muted">Comprobante de pago</span>
          <div className="flex flex-col">
            <h2 className="display text-[28px] leading-[30px]">{c.restaurante}</h2>
            <span className="text-[13px] leading-[18px] text-ink-secondary">{c.lugar}</span>
            <span className="text-[13px] leading-[18px] text-ink-secondary">{c.fecha}</span>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-dashed border-line pt-2.5 text-sm">
            <div className="flex justify-between text-ink-secondary"><span>Pedidos</span><span>{c.pedidos}</span></div>
            {c.filas.map(([izq, der]) => (
              <div key={izq} className="flex justify-between"><span>{izq}</span><span className="tabular-nums">{der}</span></div>
            ))}
          </div>
          <div className="flex items-baseline justify-between border-t border-dashed border-line pt-2">
            <span className="text-[15px] font-semibold">Total</span>
            <span className="display text-[32px] leading-9 tabular-nums">{c.total}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-ink-secondary">
            <span>{c.metodo}</span>
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-text">Pagado</span>
          </div>
        </section>
      </div>
    </Screen>
  );
}
