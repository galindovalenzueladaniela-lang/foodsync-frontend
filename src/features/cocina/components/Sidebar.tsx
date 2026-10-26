import { Link, useLocation } from 'react-router-dom';
import isotipo from '../../../assets/foodsync-isotipo.svg';
import { rutasCocina } from '../../../app/rutas';
import type { Personal } from '../../../services/types';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';

interface Item { to: string; icono: IconName; texto: string; activo: boolean; contador?: number; tono?: 'primary' | 'accent' }

function ItemNav({ to, icono, texto, activo, contador, tono = 'primary' }: Item) {
  return (
    <Link
      to={to} aria-current={activo ? 'page' : undefined}
      className={cn(
        'relative flex h-11 w-full items-center gap-3 rounded-md border px-3 text-sm leading-5 transition-colors duration-200 focus-visible:shadow-focus max-xl:justify-center max-xl:px-0',
        activo ? 'kds-nav-activo font-semibold text-on-primary' : 'border-transparent font-medium text-kds-text-secondary hover:bg-[rgba(255,248,240,0.06)]',
      )}
    >
      <Icon name={icono} size={20} className={cn('block shrink-0', activo ? 'text-accent' : 'text-kds-text-muted')} />
      <span className="flex-1 max-xl:sr-only">{texto}</span>
      {!!contador && (
        <span
          className={cn(
            'h-5 min-w-[22px] rounded-full px-[7px] text-center text-[11px] font-bold leading-5 max-xl:absolute max-xl:right-1 max-xl:top-0',
            tono === 'primary' ? 'bg-primary text-on-primary' : 'bg-accent text-ink',
          )}
        >
          {contador}
          <span className="sr-only">{tono === 'primary' ? ' activas' : ' sin leer'}</span>
        </span>
      )}
    </Link>
  );
}

/* Sidebar de 220 px del lienzo 14 (riel de iconos en tablet vertical). */
export function Sidebar({ personal, activas, sinLeer, onSalir }: { personal: Personal; activas: number; sinLeer: number; onSalir: () => void }) {
  const { pathname } = useLocation();
  return (
    <aside className="kds-linea flex w-[220px] shrink-0 flex-col gap-1 border-r px-3 py-[22px] max-xl:w-[76px] max-xl:px-2">
      <div className="flex items-center gap-2 px-2 pb-[22px] max-xl:justify-center max-xl:px-0">
        <img src={isotipo} alt="" width={28} height={28} className="shrink-0" />
        <span className="display text-[30px] leading-[0.9] tracking-[-0.015em] text-kds-text max-xl:sr-only">FoodSync</span>
      </div>
      <nav aria-label="Cocina" className="flex flex-col gap-1">
        <ItemNav to={rutasCocina.comandas()} icono="cocina" texto="Comandas" contador={activas}
          activo={pathname === rutasCocina.comandas() || pathname.startsWith('/cocina/comanda/')} />
        <ItemNav to={rutasCocina.pedidos()} icono="pedidos" texto="Pedidos" activo={pathname === rutasCocina.pedidos()} />
        <ItemNav to={rutasCocina.notificaciones()} icono="notificaciones" texto="Notificaciones" contador={sinLeer} tono="accent"
          activo={pathname === rutasCocina.notificaciones()} />
      </nav>
      <div className="flex-1" />
      <div className="kds-barra mb-2 flex flex-col gap-1 rounded-md p-3.5 max-xl:hidden">
        <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-kds-text-muted">{personal.turno.nombre}</span>
        <span className="text-sm leading-5 text-on-primary">{listaNombres(personal.turno.equipo)}</span>
      </div>
      <ItemNav to={rutasCocina.perfil()} icono="perfil" texto="Mi perfil" activo={pathname === rutasCocina.perfil()} />
      <button
        type="button" onClick={onSalir}
        className="flex h-11 w-full items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium leading-5 text-kds-text-secondary transition-colors hover:bg-[rgba(255,248,240,0.06)] focus-visible:shadow-focus max-xl:justify-center max-xl:px-0"
      >
        <Icon name="salir" size={20} className="block shrink-0 text-kds-text-muted" />
        <span className="flex-1 text-left max-xl:sr-only">Salir</span>
      </button>
    </aside>
  );
}

/** "Sofía, Diego y Mateo" */
export function listaNombres(nombres: string[]): string {
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres.join('');
}
