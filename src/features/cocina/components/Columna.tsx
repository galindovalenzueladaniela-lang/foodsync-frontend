import type { Comanda } from '../../../services/types';
import { cn } from '../../../shared/lib/cn';
import type { EstadoTablero } from '../lib/filtros';
import { ESTILO_ESTADO } from '../lib/estilos';
import { ComandaCard } from './ComandaCard';

/** Columna del tablero (Pendientes / En preparación / Listos). Ampliada cuando se filtra por un solo estado. */
export function Columna({ estado, comandas, ahora, onAvanzar, ampliada }: {
  estado: EstadoTablero; comandas: Comanda[] | null; ahora: number; onAvanzar: (c: Comanda) => Promise<void>; ampliada?: boolean;
}) {
  const e = ESTILO_ESTADO[estado];
  return (
    <section aria-label={e.columna} className="kds-panel flex flex-col gap-3.5 rounded-xl p-3.5 lg:min-h-0">
      <div className="flex items-center gap-2.5 px-1 py-0.5">
        <span aria-hidden="true" className={cn('h-3 w-3 rounded-full', e.punto, e.anilloColumna, estado === 'en_preparacion' && 'kds-punto-vivo')} />
        <h2 className="font-sans text-xl font-bold leading-6">{e.columna}</h2>
        <span className="kds-contador ml-auto h-[30px] min-w-[30px] rounded-full px-2.5 text-center text-base font-bold leading-[30px]">
          <span key={comandas?.length ?? -1} className="kds-pop">{comandas?.length ?? '–'}</span>
        </span>
      </div>
      <div
        className={cn(
          'pb-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto',
          ampliada ? 'grid content-start gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]' : 'flex flex-col gap-3.5',
        )}
      >
        {comandas === null
          ? [0, 1].map((i) => <div key={i} aria-hidden="true" className="kds-tarjeta h-60 shrink-0 animate-pulse opacity-50" />)
          : comandas.length === 0
            ? <p className="rounded-lg border border-dashed border-[rgba(255,248,240,0.16)] px-4 py-8 text-center text-[15px] text-kds-text-muted">{e.vacio}</p>
            : comandas.map((c) => <ComandaCard key={c.id} comanda={c} ahora={ahora} onAvanzar={onAvanzar} />)}
      </div>
    </section>
  );
}
