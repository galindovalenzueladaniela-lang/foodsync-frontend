import type { Pedido } from '../../../services/types';
import { Icon } from '../../../shared/ui/Icon';
import { horaCorta } from '../../../shared/lib/time';
import { cn } from '../../../shared/lib/cn';

/* Mismos estados del sistema, contados en lenguaje cercano (principio iv del diseño). */
const PASOS = [
  { estado: 'pendiente', titulo: 'Pendiente', hecho: (h: string) => `Recibido a las ${h}`, espera: 'Lo enviamos a cocina' },
  { estado: 'en_preparacion', titulo: 'En preparación', hecho: (h: string) => `Desde las ${h} · la cocina está en ello`, espera: 'La cocina lo empezará en breve' },
  { estado: 'listo', titulo: 'Listo', hecho: (h: string) => `Salió de cocina a las ${h}`, espera: 'Te avisaremos cuando salga de cocina' },
  { estado: 'entregado', titulo: 'Entregado', hecho: (h: string) => `En tu mesa desde las ${h}`, espera: 'En tu mesa' },
] as const;

export function EstadoTimeline({ pedido }: { pedido: Pedido }) {
  const actual = PASOS.findIndex((p) => p.estado === pedido.estado);
  return (
    <ol className="flex flex-col rounded-lg border border-line-subtle bg-surface px-[18px] pb-1.5 pt-[18px] shadow-xs">
      {PASOS.map((paso, i) => {
        const registro = pedido.historial.find((h) => h.estado === paso.estado);
        const hecho = i < actual || (i === actual && paso.estado === 'entregado');
        const enCurso = i === actual && !hecho;
        return (
          <li key={paso.estado} className="flex gap-3.5" aria-current={enCurso ? 'step' : undefined}>
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={cn(
                  'relative inline-flex h-[26px] w-[26px] items-center justify-center rounded-full',
                  hecho && 'bg-status-listo text-white',
                  enCurso && 'estado-latido bg-status-preparacion shadow-[0_0_0_5px_rgba(200,105,58,0.18)]',
                  !hecho && !enCurso && 'bg-[#EFE8DF]',
                )}
              >
                {hecho && <Icon name="check" size={14} strokeWidth={2.2} />}
                {/* En curso: núcleo que late (la cocina está trabajando en él) */}
                {enCurso && <span aria-hidden="true" className="estado-nucleo relative z-[1] h-2.5 w-2.5 rounded-full bg-surface" />}
              </span>
              {i < PASOS.length - 1 && (
                <span className={cn('relative my-1 min-h-[22px] w-0.5 flex-1 overflow-hidden', hecho ? 'bg-status-listo' : 'bg-[#EFE8DF]')}>
                  {enCurso && <span aria-hidden="true" className="estado-flujo absolute inset-x-0 top-0 h-1/2" />}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 pb-3.5">
              <span className={cn('text-[15px] leading-[22px]', enCurso ? 'font-semibold text-ink' : hecho ? 'font-medium text-ink' : 'text-ink-muted')}>{paso.titulo}</span>
              <span className="text-xs leading-4 text-ink-muted">{registro ? paso.hecho(horaCorta(registro.en)) : paso.espera}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
