import { useMemo, useRef, useState } from 'react';
import { rutas } from '../../../app/rutas';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../shared/layout/Screen';
import { Icon } from '../../../shared/ui/Icon';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import { useToast } from '../../../shared/ui/Toast';
import { cn } from '../../../shared/lib/cn';
import { llamarMesero } from '../../../services/mesaService';
import type { Producto } from '../../../services/types';
import { useMesa } from '../../mesa/context/MesaContext';
import { useCart } from '../../pedido/cart/CartContext';
import { useMenu } from '../hooks/useMenu';
import { FeaturedCard } from '../components/FeaturedCard';
import { ProductCard } from '../components/ProductCard';
import { CartBar } from '../components/CartBar';

const DESTACADOS = 'destacados';
const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Paso 3 · Menú digital: categorías, destacados y promociones, lista de productos (RF3, RF4, RF7). */
export function MenuPage() {
  const { ctx, money } = useMesa();
  const { menu } = useMenu(ctx.token);
  const { lineas, platos, total, cantidadDe, dispatch } = useCart();
  const navigate = useNavigate();
  const avisar = useToast();
  const [busqueda, setBusqueda] = useState('');
  const [activa, setActiva] = useState(DESTACADOS);
  const secciones = useRef(new Map<string, HTMLElement>());

  const q = normalizar(busqueda.trim());
  const coincide = (p: Producto) => !q || normalizar(`${p.nombre} ${p.descripcion}`).includes(q);
  const destacados = useMemo(() => menu?.productos.filter((p) => (p.destacado || p.promocion) && p.disponible) ?? [], [menu]);

  const abrir = (p: Producto) => navigate(rutas.producto(ctx.token, p.id));
  // Sin opciones que elegir se agrega directo; con variantes o extras se abre el detalle.
  const agregar = (p: Producto) => {
    if (p.variantes.length > 1 || p.extras.length > 0) return abrir(p);
    dispatch({ type: 'agregar', producto: p, seleccion: { varianteId: p.variantes[0]?.id, extrasIds: [] }, observaciones: '', cantidad: 1 });
  };
  const quitarUno = (p: Producto) => {
    const ultima = [...lineas].reverse().find((l) => l.producto.id === p.id);
    if (ultima) dispatch({ type: 'cantidad', id: ultima.id, cantidad: ultima.cantidad - 1 });
  };
  const irA = (id: string) => {
    setActiva(id);
    secciones.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const ref = (id: string) => (el: HTMLElement | null) => { if (el) secciones.current.set(id, el); };

  const pedirMesero = async () => {
    await llamarMesero(ctx.token);
    avisar('Avisamos al personal', 'notificaciones');
  };

  return (
    <Screen
      className="gap-5 pb-4"
      footer={platos > 0 && <CartBar platos={platos} mesa={ctx.mesa.numero} total={money(total)} onOpen={() => navigate(rutas.pedido(ctx.token))} />}
    >
      <header className="flex flex-col gap-3.5 px-5 pt-5">
        <div className="flex items-center justify-between gap-2">
          <span className="display text-[26px] leading-7">{ctx.restaurante.nombre}</span>
          <div className="flex items-center gap-1.5">
            <span className="glass inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-primary">
              <Icon name="mesas" size={14} /> Mesa {ctx.mesa.numero}
            </span>
            {/* RF7: botón visible para llamar al mesero con alerta silenciosa. */}
            <button type="button" onClick={pedirMesero} aria-label="Llamar al mesero" title="Llamar al mesero"
              className="glass inline-flex h-8 w-8 items-center justify-center rounded-full text-primary transition hover:bg-elevated">
              <Icon name="notificaciones" size={16} />
            </button>
          </div>
        </div>
        <h1 className="display text-[34px] leading-9 tracking-[-0.01em]">
          ¿Qué se te <em className="text-primary">antoja</em> hoy?
        </h1>
        <label className="glass flex h-[42px] items-center gap-2 rounded-full px-3.5 text-sm text-ink-muted has-[:focus-visible]:shadow-focus">
          <Icon name="buscar" size={18} />
          <span className="sr-only">Buscar</span>
          <input
            type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Busca un plato o bebida"
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </label>
        <nav aria-label="Categorías" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {[{ id: DESTACADOS, nombre: 'Destacados' }, ...(menu?.categorias ?? [])].map((c) => (
            <button
              key={c.id} type="button" onClick={() => irA(c.id)} aria-current={activa === c.id ? 'true' : undefined}
              className={cn(
                'h-[34px] shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition',
                activa === c.id ? 'border-primary bg-primary text-on-primary shadow-[0_6px_14px_-8px_rgba(110,46,63,0.6)]' : 'border-white/90 bg-white/60 text-[#4E4239] hover:bg-white',
              )}
            >
              {c.nombre}
            </button>
          ))}
        </nav>
      </header>

      {!menu && <p className="px-5 text-sm text-ink-secondary">Cargando la carta…</p>}

      {menu && destacados.some(coincide) && (
        <section ref={ref(DESTACADOS)} className="flex scroll-mt-4 flex-col gap-3">
          <SectionLabel as="h2" className="px-5">Destacados y promociones</SectionLabel>
          <div className="no-scrollbar flex snap-x gap-2.5 overflow-x-auto px-5 pb-1">
            {destacados.filter(coincide).map((p) => (
              <FeaturedCard key={p.id} producto={p} precio={money(p.precio)} onOpen={() => abrir(p)} onAdd={() => agregar(p)} />
            ))}
          </div>
        </section>
      )}

      {menu?.categorias.map((c) => {
        const productos = menu.productos.filter((p) => p.categoriaId === c.id && coincide(p));
        if (!productos.length) return null;
        return (
          <section key={c.id} ref={ref(c.id)} className="flex scroll-mt-4 flex-col gap-2.5 px-5">
            <SectionLabel as="h2">{c.nombre}</SectionLabel>
            {productos.map((p) => (
              <ProductCard
                key={p.id} producto={p} precio={money(p.precio)} cantidad={cantidadDe(p.id)}
                onOpen={() => abrir(p)} onAdd={() => agregar(p)} onRemove={() => quitarUno(p)}
              />
            ))}
          </section>
        );
      })}

      {menu && q && !menu.productos.some(coincide) && (
        <p className="px-5 text-sm text-ink-secondary">No encontramos «{busqueda}» en la carta.</p>
      )}
    </Screen>
  );
}
