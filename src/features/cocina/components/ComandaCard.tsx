import { Link } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { NOMBRE_AREA, NOMBRE_CANAL } from '../../../services/estadosPedido';
import type { Comanda } from '../../../services/types';
import { cn } from '../../../shared/lib/cn';
import { ESTILO_ESTADO } from '../lib/estilos';
import { minutosDesde } from '../lib/tiempo';
import { BotonEstado } from './BotonEstado';
import { EtiquetaEstado, NotaCocina, TiempoChip } from './Etiquetas';

/** Observaciones que cocina debe leer: nota del pedido y las de cada plato que sigue en pie. */
export function notasDe(c: Comanda): string[] {
  return [c.nota, ...c.lineas.filter((l) => !l.cancelada).map((l) => l.observaciones)].filter((n): n is string => !!n?.trim());
}

/* Tarjeta porcelana del lienzo 14: franja del estado, mesa en serif 32 px, platos en 19 px y un solo botón. */
export function ComandaCard({ comanda: c, ahora, onAvanzar }: { comanda: Comanda; ahora: number; onAvanzar: (c: Comanda) => Promise<void> }) {
  const e = ESTILO_ESTADO[c.estado];
  const recien = ahora - new Date(c.creadoEn).getTime() < 60_000;
  return (
    <article className={cn('kds-tarjeta relative flex shrink-0 flex-col overflow-hidden border-t-[6px] text-ink transition-[border-color] duration-[250ms]', e.franja, recien && 'aviso-entra')}>
      <header className="flex items-start justify-between gap-2.5 px-4 pb-2.5 pt-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          {/* Toda la tarjeta abre el detalle; el botón de estado queda por encima. */}
          <Link
            to={rutasCocina.comanda(c.id)}
            className="display truncate text-[32px] leading-8 after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:shadow-focus"
          >
            {c.mesa}
          </Link>
          <span className="text-[13px] leading-[18px] text-ink-secondary">#{c.numero} · {NOMBRE_CANAL[c.canal]} · {NOMBRE_AREA[c.area]}</span>
        </div>
        <TiempoChip minutos={minutosDesde(c.creadoEn, ahora)} />
      </header>
      <div className="px-4 pb-2.5"><EtiquetaEstado estado={c.estado} /></div>
      <ul className="flex flex-col gap-2 border-t border-dashed border-line-dashed px-4 pb-3 pt-1">
        {c.lineas.map((l) => (
          <li key={l.indice} className={cn('flex gap-2.5 pt-2 text-[19px] font-semibold leading-6', l.cancelada && 'text-ink-muted')}>
            <span className={cn('min-w-[30px] tabular-nums', l.cancelada ? 'text-ink-muted' : e.cantidad)}>{l.cantidad}×</span>
            <span className={cn(l.cancelada && 'line-through')}>{l.nombre}</span>
            {l.cancelada && <span className="sr-only">(cancelado)</span>}
          </li>
        ))}
      </ul>
      <NotaCocina notas={notasDe(c)} className="mx-4 mb-3" />
      <BotonEstado comanda={c} onAvanzar={onAvanzar} className="relative z-10 px-4 pb-4" />
    </article>
  );
}
