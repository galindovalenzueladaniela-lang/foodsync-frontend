import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { NOMBRE_AREA, NOMBRE_CANAL } from '../../../services/estadosPedido';
import type { Area, Canal, EstadoPedido } from '../../../services/types';
import { Icon } from '../../../shared/ui/Icon';
import { Encabezado, Reloj, Segmentos } from '../components/Encabezado';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { EtiquetaEstado, TiempoChip } from '../components/Etiquetas';
import { useCocina } from '../hooks/useCocina';
import { ESTILO_ESTADO } from '../lib/estilos';
import { filtrarHistorial, momento, type FiltroHistorial } from '../lib/filtros';
import { horaLocal, minutosDesde } from '../lib/tiempo';

const ESTADOS: Array<{ valor: EstadoPedido | 'todos'; texto: string }> = [
  { valor: 'todos', texto: 'Todos' },
  ...(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'] as const).map((e) => ({ valor: e, texto: e === 'listo' ? 'Listo' : ESTILO_ESTADO[e].etiqueta })),
];
const AREAS: Array<{ valor: Area | 'todas'; texto: string }> = [
  { valor: 'todas', texto: 'Todas' }, ...(Object.keys(NOMBRE_AREA) as Area[]).map((a) => ({ valor: a, texto: NOMBRE_AREA[a] })),
];
const CANALES: Array<{ valor: Canal | 'todos'; texto: string }> = [
  { valor: 'todos', texto: 'Todos' }, ...(Object.keys(NOMBRE_CANAL) as Canal[]).map((c) => ({ valor: c, texto: NOMBRE_CANAL[c] })),
];
const SIN_FILTROS: FiltroHistorial = { texto: '', estado: 'todos', area: 'todas', canal: 'todos' };

/* Pedidos: historial del turno con búsqueda y filtros por estado, área y canal (RF10). */
export function PedidosPage() {
  const { comandas, ahora, recargar } = useCocina();
  const [f, setF] = useState<FiltroHistorial>(SIN_FILTROS);
  const lista = useMemo(() => (comandas.tipo === 'listo' ? filtrarHistorial(comandas.datos, f) : []), [comandas, f]);
  const total = comandas.tipo === 'listo' ? comandas.datos.length : 0;
  const filtrando = JSON.stringify(f) !== JSON.stringify(SIN_FILTROS);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
      <Encabezado titulo="Pedidos">
        <span className="kds-chip rounded-full px-3.5 py-2 text-[15px] font-semibold">Historial del turno · {total}</span>
        <div className="flex-1" />
        <Reloj />
      </Encabezado>

      <div className="flex flex-col gap-3">
        <label className="relative block max-w-[460px]">
          <span className="sr-only">Buscar por mesa, número o plato</span>
          <Icon name="buscar" size={20} className="pointer-events-none absolute left-4 top-1/2 block -translate-y-1/2 text-kds-text-muted" />
          <input
            type="search" value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} placeholder="Buscar mesa, número o plato"
            className="kds-chip-borde h-14 w-full rounded-full pl-12 pr-5 text-base text-on-primary outline-none placeholder:text-kds-text-muted focus-visible:shadow-focus"
          />
        </label>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Filtro etiqueta="Estado"><Segmentos etiqueta="Estado" opciones={ESTADOS} valor={f.estado} onCambio={(estado) => setF({ ...f, estado })} /></Filtro>
          <Filtro etiqueta="Área"><Segmentos etiqueta="Área" opciones={AREAS} valor={f.area} onCambio={(area) => setF({ ...f, area })} /></Filtro>
          <Filtro etiqueta="Canal"><Segmentos etiqueta="Canal" opciones={CANALES} valor={f.canal} onCambio={(canal) => setF({ ...f, canal })} /></Filtro>
        </div>
      </div>

      {comandas.tipo === 'cargando' && <Cargando texto="Cargando los pedidos del turno…" />}
      {comandas.tipo === 'error' && (
        <ErrorCarga titulo="No pudimos cargar los pedidos" detalle="Revisa la conexión y vuelve a intentarlo." onReintentar={recargar} />
      )}
      {comandas.tipo === 'listo' && lista.length === 0 && (
        <Vacio icono="pedidos" titulo={filtrando ? 'Sin pedidos con estos filtros' : 'Aún no hay pedidos en este turno'}
          detalle={filtrando ? 'Prueba con otra búsqueda o quita los filtros.' : 'Los pedidos aparecerán aquí en cuanto lleguen a cocina.'}>
          {filtrando && (
            <button type="button" onClick={() => setF(SIN_FILTROS)} className="kds-chip-borde mt-2 h-14 rounded-full px-6 text-base font-semibold hover:bg-[rgba(255,248,240,0.14)] focus-visible:shadow-focus">
              Quitar filtros
            </button>
          )}
        </Vacio>
      )}
      {lista.length > 0 && (
        <ul className="kds-tarjeta flex flex-col overflow-hidden text-ink">
          {lista.map((c) => {
            const fin = momento(c, 'entregado') ?? momento(c, 'cancelado');
            return (
              <li key={c.id} className="border-t border-line-subtle first:border-t-0">
                <Link
                  to={rutasCocina.comanda(c.id)}
                  className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-none lg:grid-cols-[200px_minmax(0,1fr)_56px_250px_20px]"
                >
                  <span className="flex flex-col">
                    <span className="display text-[26px] leading-7">{c.mesa}</span>
                    <span className="text-[13px] text-ink-secondary">#{c.numero} · {NOMBRE_CANAL[c.canal]} · {NOMBRE_AREA[c.area]}</span>
                  </span>
                  <span className="col-span-2 row-start-2 truncate text-[15px] text-ink-secondary lg:col-span-1 lg:row-start-auto">
                    {c.lineas.map((l) => `${l.cantidad}× ${l.nombre}`).join(' · ')}
                  </span>
                  <span className="hidden flex-col text-right text-sm tabular-nums text-ink-secondary lg:flex">
                    <span>{horaLocal(c.creadoEn)}</span>
                    {fin && <span className="text-xs text-ink-muted">→ {horaLocal(fin)}</span>}
                  </span>
                  <span className="flex items-center justify-end gap-2">
                    {(c.estado === 'pendiente' || c.estado === 'en_preparacion') && <TiempoChip minutos={minutosDesde(c.creadoEn, ahora)} className="max-lg:hidden" />}
                    <EtiquetaEstado estado={c.estado} />
                  </span>
                  <Icon name="chevron-right" size={20} className="hidden text-ink-muted lg:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Filtro({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-kds-text-muted">{etiqueta}</span>
      {children}
    </div>
  );
}
