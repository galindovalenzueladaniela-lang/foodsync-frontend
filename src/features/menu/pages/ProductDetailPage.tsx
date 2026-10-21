import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { ChoiceRow } from '../../../shared/ui/ChoiceRow';
import { FoodImage } from '../../../shared/ui/FoodImage';
import { Icon } from '../../../shared/ui/Icon';
import { Pill } from '../../../shared/ui/Pill';
import { QuantityStepper } from '../../../shared/ui/QuantityStepper';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import type { Producto } from '../../../services/types';
import { useMesa } from '../../mesa/context/MesaContext';
import { useCart } from '../../pedido/cart/CartContext';
import type { LineaCarrito } from '../../pedido/cart/cartReducer';
import { precioUnitario } from '../../pedido/cart/precio';
import { useMenu } from '../hooks/useMenu';

/* Paso 4 · Detalle del producto: variante obligatoria, extras con costo y observaciones (RF4).
   Con ?linea=<id> edita una línea que ya está en el pedido. */
export function ProductDetailPage() {
  const { ctx } = useMesa();
  const { productoId } = useParams();
  const [params] = useSearchParams();
  const { menu } = useMenu(ctx.token);
  const { lineas } = useCart();
  const producto = menu?.productos.find((p) => p.id === productoId);
  const linea = lineas.find((l) => l.id === params.get('linea'));

  if (!menu) return <Screen tone="surface"><p className="p-6 text-sm text-ink-secondary">Cargando…</p></Screen>;
  if (!producto) return <Screen tone="surface"><p className="p-6 text-sm text-ink-secondary">Este plato ya no está en la carta.</p></Screen>;
  return <Detalle key={producto.id + (linea?.id ?? '')} producto={producto} linea={linea} />;
}

function Detalle({ producto: p, linea }: { producto: Producto; linea?: LineaCarrito }) {
  const { ctx, money } = useMesa();
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const [varianteId, setVarianteId] = useState(linea?.varianteId ?? p.variantes[0]?.id);
  const [extrasIds, setExtrasIds] = useState<string[]>(linea?.extrasIds ?? []);
  const [observaciones, setObservaciones] = useState(linea?.observaciones ?? '');
  const [cantidad, setCantidad] = useState(linea?.cantidad ?? 1);

  const seleccion = { varianteId, extrasIds };
  const importe = precioUnitario(p, seleccion) * cantidad;
  // Vuelve a donde estaba (menú o Tu pedido); si se abrió por enlace directo, al menú.
  const cerrar = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate(rutas.menu(ctx.token)));
  const toggleExtra = (id: string) => setExtrasIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const confirmar = () => {
    const obs = observaciones.trim();
    if (linea) dispatch({ type: 'actualizar', id: linea.id, seleccion, observaciones: obs, cantidad });
    else dispatch({ type: 'agregar', producto: p, seleccion, observaciones: obs, cantidad });
    cerrar();
  };

  return (
    <Screen
      tone="surface"
      footer={
        <div className="flex items-center gap-3 border-t border-line-subtle bg-surface pt-3">
          <QuantityStepper size="md" label="Cantidad" value={cantidad} onChange={setCantidad} />
          <Button className="flex-1" onClick={confirmar} disabled={!p.disponible}>
            {!p.disponible ? 'Agotado' : `${linea ? 'Guardar' : 'Agregar'} · ${money(importe)}`}
          </Button>
        </div>
      }
    >
      <FoodImage tono={p.tono} fotoUrl={p.fotoUrl} alt={p.nombre} className="h-[240px] shrink-0">
        <button
          type="button" onClick={cerrar} aria-label="Cerrar"
          className="floating absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink"
        >
          <Icon name="cerrar" size={18} />
        </button>
      </FoodImage>

      <div className="relative -mt-6 flex flex-col gap-4 rounded-t-xl bg-surface px-5 pt-5">
        <div className="flex flex-col gap-1.5">
          {(p.etiquetas.length > 0 || p.destacado) && (
            <div className="flex gap-1.5">
              {p.etiquetas.map((e) => <Pill key={e} tone="success" className="px-2 py-0.5">{e}</Pill>)}
              {p.destacado && <Pill className="px-2 py-0.5">{p.destacado}</Pill>}
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="display text-[30px] leading-8">{p.nombre}</h1>
            <span className="display whitespace-nowrap text-2xl leading-7 tabular-nums text-primary">{money(p.precio)}</span>
          </div>
          <p className="text-[13px] leading-[19px] text-ink-secondary">{p.descripcionLarga ?? p.descripcion}</p>
        </div>

        {p.variantes.length > 0 && (
          <fieldset className="flex flex-col gap-1.5">
            <SectionLabel as="legend" className="mb-1.5">Variante</SectionLabel>
            {p.variantes.map((v) => (
              <ChoiceRow
                key={v.id} type="radio" name="variante" className="h-10"
                checked={varianteId === v.id} onChange={() => setVarianteId(v.id)}
                label={v.nombre} aside={v.precioExtra > 0 && `+ ${money(v.precioExtra)}`}
              />
            ))}
          </fieldset>
        )}

        {p.extras.length > 0 && (
          <fieldset className="flex flex-col gap-1.5">
            <SectionLabel as="legend" className="mb-1.5">Complementos y extras</SectionLabel>
            {p.extras.map((e) => (
              <ChoiceRow
                key={e.id} type="checkbox" name={`extra-${e.id}`} className="h-[38px]"
                checked={extrasIds.includes(e.id)} onChange={() => toggleExtra(e.id)}
                label={e.nombre} aside={`+ ${money(e.precioExtra)}`}
              />
            ))}
          </fieldset>
        )}

        <label className="flex flex-col gap-1.5 pb-2">
          <SectionLabel>Observaciones</SectionLabel>
          <textarea
            value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={1} maxLength={140}
            placeholder="¿Algo que la cocina deba saber?"
            className="min-h-10 resize-none rounded-md border border-line-subtle bg-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus-visible:shadow-focus"
          />
        </label>
      </div>
    </Screen>
  );
}
