import type { Producto } from '../../../services/types';
import { FoodImage } from '../../../shared/ui/FoodImage';
import { Icon } from '../../../shared/ui/Icon';
import { Pill } from '../../../shared/ui/Pill';
import { QuantityStepper } from '../../../shared/ui/QuantityStepper';
import { cn } from '../../../shared/lib/cn';

interface Props {
  producto: Producto;
  precio: string;
  cantidad: number;
  onOpen: () => void;
  onAdd: () => void;
  onRemove: () => void;
}

/** Fila de producto del menú. Si está agotado se atenúa y no permite agregar (RF4). */
export function ProductCard({ producto: p, precio, cantidad, onOpen, onAdd, onRemove }: Props) {
  const agotado = !p.disponible;
  return (
    <article className={cn('card flex gap-3.5 p-2.5', agotado && 'opacity-[0.72]')}>
      <button type="button" onClick={onOpen} disabled={agotado} className="shrink-0" aria-label={`Ver ${p.nombre}`}>
        <FoodImage tono={p.tono} fotoUrl={p.fotoUrl} alt={p.nombre} agotado={agotado} className="h-[92px] w-[92px] rounded-md">
          {p.etiquetas[0] && <span className="absolute left-2 top-2"><Pill tone="glass-success">{p.etiquetas[0]}</Pill></span>}
        </FoodImage>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5 pr-1">
        <button type="button" onClick={onOpen} disabled={agotado} className="flex flex-col gap-1 text-left">
          <h3 className="display text-[19px] leading-[1.12]">{p.nombre}</h3>
          <p className="line-clamp-2 text-[13px] leading-[18px] text-ink-secondary">{p.descripcion}</p>
        </button>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className={cn('display whitespace-nowrap text-[22px] leading-6 tabular-nums', agotado ? 'text-ink-muted' : 'text-primary')}>{precio}</span>
          {agotado ? (
            <Pill tone="neutral" className="rounded-sm px-2.5 py-1 text-xs">Agotado</Pill>
          ) : cantidad > 0 ? (
            <QuantityStepper label={`Cantidad de ${p.nombre}`} value={cantidad} min={0} onChange={(n) => (n > cantidad ? onAdd() : onRemove())} />
          ) : (
            <button
              type="button" onClick={onAdd} aria-label={`Agregar ${p.nombre}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-brand transition hover:bg-primary-hover"
            >
              <Icon name="agregar" size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
