import { Link, useSearchParams } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { NOMBRE_AREA } from '../../../services/estadosPedido';
import type { Area } from '../../../services/types';
import { Icon } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { Columna } from '../components/Columna';
import { Encabezado, Reloj, Segmentos } from '../components/Encabezado';
import { ErrorCarga } from '../components/Estados';
import { useCocina } from '../hooks/useCocina';
import { useSesion } from '../hooks/useSesion';
import { ESTILO_ESTADO, textoContador } from '../lib/estilos';
import { ESTADOS_TABLERO, columnas, columnasVisibles, contarPorEstado, entregadasRecientes, type EstadoTablero, type FiltroArea } from '../lib/filtros';

const AREAS: Array<{ valor: FiltroArea; texto: string }> = [
  { valor: 'todas', texto: 'Todas' },
  ...(Object.keys(NOMBRE_AREA) as Area[]).map((a) => ({ valor: a, texto: NOMBRE_AREA[a] })),
];

/* Comandas (lienzo 14): tres columnas por estado, filtros por área y por estado, y entregados hace poco. */
export function ComandasPage() {
  const { personal } = useSesion();
  const { comandas, ahora, avanzar, recargar } = useCocina();
  // Los filtros viven en la URL: al volver del detalle se conservan.
  const [params, setParams] = useSearchParams();
  const area = (params.get('area') as FiltroArea | null) ?? personal!.area;
  const estado = params.get('estado') as EstadoTablero | null;
  const cambiar = (clave: 'area' | 'estado', valor: string | null) => {
    const p = new URLSearchParams(params);
    if (valor) p.set(clave, valor);
    else p.delete(clave);
    setParams(p, { replace: true });
  };

  const lista = comandas.tipo === 'listo' ? comandas.datos : [];
  const porColumna = columnas(lista, area);
  const conteo = contarPorEstado(lista, area);
  const recientes = entregadasRecientes(lista, area);
  const visibles = columnasVisibles(estado);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5 lg:overflow-hidden">
      <Encabezado titulo="Comandas">
        <Segmentos etiqueta="Área de cocina" opciones={AREAS} valor={area} onCambio={(v) => cambiar('area', v)} />
        <div className="flex-1" />
        <Reloj className="2xl:order-last" />
        {/* Contadores por estado: también filtran el tablero. */}
        <div role="group" aria-label="Filtrar por estado" className="flex w-full flex-wrap gap-2 2xl:w-auto">
          {ESTADOS_TABLERO.map((e) => (
            <button
              key={e} type="button" aria-pressed={estado === e} onClick={() => cambiar('estado', estado === e ? null : e)}
              title={estado === e ? 'Ver todas las columnas' : `Ver solo ${ESTILO_ESTADO[e].columna.toLowerCase()}`}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[15px] font-semibold transition-colors duration-200 focus-visible:shadow-focus',
                estado === e ? 'bg-surface text-ink' : 'kds-chip hover:bg-[rgba(255,248,240,0.14)]',
              )}
            >
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', ESTILO_ESTADO[e].punto)} />
              {textoContador(e, conteo[e])}
              {estado === e && <Icon name="cerrar" size={14} strokeWidth={2} className="block text-ink-secondary" />}
            </button>
          ))}
        </div>
      </Encabezado>

      {comandas.tipo === 'error' ? (
        <ErrorCarga
          className="flex-1" titulo="No pudimos cargar las comandas"
          detalle="Revisa la conexión del pase. Las comandas no se pierden: aparecerán en cuanto vuelva la señal." onReintentar={recargar}
        />
      ) : (
        <div className={cn('grid gap-[18px] lg:min-h-0 lg:flex-1', visibles.length === 3 ? 'lg:grid-cols-3' : 'grid-cols-1')}>
          {visibles.map((e) => (
            <Columna key={e} estado={e} comandas={comandas.tipo === 'listo' ? porColumna[e] : null} ahora={ahora} onAvanzar={avanzar} ampliada={visibles.length === 1} />
          ))}
        </div>
      )}

      <div className="kds-barra flex shrink-0 flex-wrap items-center gap-3 rounded-lg px-4 py-3">
        <span className="text-[13px] font-semibold uppercase leading-[18px] tracking-[0.12em] text-kds-text-muted">Entregados hace poco</span>
        {recientes.length === 0 && <span className="text-sm text-kds-text-muted">Aún no hay entregas{area !== 'todas' ? ` en ${NOMBRE_AREA[area]}` : ''}.</span>}
        {recientes.map((c) => (
          <Link
            key={c.id} to={rutasCocina.comanda(c.id)}
            className="kds-chip inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-kds-text-secondary transition-colors hover:bg-[rgba(255,248,240,0.14)] focus-visible:shadow-focus"
          >
            <Icon name="check" size={14} strokeWidth={2} className="block" />
            {c.mesa} · #{c.numero}
          </Link>
        ))}
      </div>
    </div>
  );
}
