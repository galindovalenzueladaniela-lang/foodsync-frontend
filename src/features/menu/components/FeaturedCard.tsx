import type { Producto } from '../../../services/types';
import { FoodImage } from '../../../shared/ui/FoodImage';
import { Icon } from '../../../shared/ui/Icon';
import { Pill } from '../../../shared/ui/Pill';

interface Props {
  producto: Producto;
  precio: string;
  onOpen: () => void;
  onAdd: () => void;
}

/** Tarjeta de "Destacados y promociones" (RF3, RF4). */
export function FeaturedCard({ producto: p, precio, onOpen, onAdd }: Props) {
  const etiqueta = p.promocion ? <Pill tone="accent">{p.promocion.etiqueta}</Pill> : p.destacado ? <Pill tone="primary">{p.destacado}</Pill> : null;
  return (
    <article className="card flex w-[164px] shrink-0 snap-start flex-col overflow-hidden">
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left" aria-label={`Ver ${p.nombre}`}>
        <FoodImage tono={p.tono} fotoUrl={p.fotoUrl} alt={p.nombre} className="h-32 w-full rounded-t-lg">
          {etiqueta && <span className="absolute left-2 top-2">{etiqueta}</span>}
        </FoodImage>
        <div className="flex flex-col gap-1 px-3.5 pt-3">
          <h3 className="display text-[21px] leading-[1.12]">{p.nombre}</h3>
          <p className="line-clamp-2 text-[13px] leading-[18px] text-ink-secondary">{p.promocion?.detalle ?? p.descripcion}</p>
        </div>
      </button>
      <div className="flex items-center justify-between px-3.5 pb-3.5 pt-2">
        <span className="display text-[22px] leading-6 tabular-nums text-primary">{precio}</span>
        <button
          type="button" onClick={onAdd} aria-label={`Agregar ${p.nombre}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-brand transition hover:bg-primary-hover"
        >
          <Icon name="agregar" size={18} />
        </button>
      </div>
    </article>
  );
}
