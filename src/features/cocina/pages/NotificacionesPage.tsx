import { useNavigate } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { marcarNotificacionesLeidas } from '../../../services/cocinaService';
import type { NotificacionCocina } from '../../../services/types';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { Encabezado, Reloj } from '../components/Encabezado';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { useCocina } from '../hooks/useCocina';
import { horaLocal, minutosDesde, textoMinutos } from '../lib/tiempo';

const TIPO: Record<NotificacionCocina['tipo'], { icono: IconName; clase: string; nombre: string }> = {
  nuevo_pedido: { icono: 'notificaciones', clase: 'bg-warning-soft text-warning-text', nombre: 'Nuevo pedido' },
  cancelacion: { icono: 'alerta', clase: 'bg-error-soft text-error-text', nombre: 'Cancelación' },
  retraso: { icono: 'reloj', clase: 'bg-paprika-soft text-paprika-text', nombre: 'Retraso' },
};

/* Notificaciones de cocina: nuevos pedidos, cancelaciones y retrasos (RF10). */
export function NotificacionesPage() {
  const { notificaciones, ahora, recargar } = useCocina();
  const navigate = useNavigate();
  const lista = notificaciones.tipo === 'listo' ? notificaciones.datos : [];
  const sinLeer = lista.filter((n) => !n.leida).length;

  const abrir = (n: NotificacionCocina) => {
    if (!n.leida) marcarNotificacionesLeidas([n.id]);
    if (n.comandaId) navigate(rutasCocina.comanda(n.comandaId));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
      <Encabezado titulo="Notificaciones">
        <span className="kds-chip rounded-full px-3.5 py-2 text-[15px] font-semibold">{sinLeer === 1 ? '1 sin leer' : `${sinLeer} sin leer`}</span>
        <div className="flex-1" />
        <button
          type="button" disabled={!sinLeer} onClick={() => marcarNotificacionesLeidas('todas')}
          className="kds-chip-borde h-14 rounded-full px-5 text-base font-semibold transition-colors hover:bg-[rgba(255,248,240,0.14)] disabled:opacity-45 focus-visible:shadow-focus"
        >
          Marcar todas como leídas
        </button>
        <Reloj />
      </Encabezado>

      {notificaciones.tipo === 'cargando' && <Cargando texto="Cargando notificaciones…" />}
      {notificaciones.tipo === 'error' && <ErrorCarga titulo="No pudimos cargar las notificaciones" detalle="Revisa la conexión y vuelve a intentarlo." onReintentar={recargar} />}
      {notificaciones.tipo === 'listo' && lista.length === 0 && (
        <Vacio icono="notificaciones" titulo="Sin notificaciones" detalle="Aquí verás los pedidos nuevos, los platillos cancelados y las comandas con retraso." />
      )}
      {lista.length > 0 && (
        <ul className="flex flex-col gap-3">
          {lista.map((n, i) => {
            const t = TIPO[n.tipo];
            const hace = minutosDesde(n.en, ahora);
            return (
              <li
                key={n.id} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className={cn('kds-tarjeta kds-entra flex flex-wrap items-center gap-4 border-l-4 px-5 py-4 text-ink transition-[border-color] duration-300', n.leida ? 'border-l-transparent' : 'border-l-accent')}
              >
                <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full', t.clase)}><Icon name={t.icono} size={20} /></span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-base leading-5">
                    {!n.leida && <span className="kds-punto-vivo h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Sin leer" />}
                    <b className={n.leida ? 'font-semibold' : 'font-bold'}>{n.titulo}</b>
                  </span>
                  <span className="text-[15px] leading-5 text-ink-secondary">{n.detalle}</span>
                  <span className="text-[13px] text-ink-muted">{t.nombre} · {hace < 1 ? 'ahora' : `hace ${textoMinutos(hace)}`} · {horaLocal(n.en)}</span>
                </div>
                <div className="flex gap-2">
                  {!n.leida && (
                    <button type="button" onClick={() => marcarNotificacionesLeidas([n.id])} className="h-14 rounded-md px-4 text-[15px] font-semibold text-primary hover:bg-primary-soft focus-visible:shadow-focus">
                      Marcar como leída
                    </button>
                  )}
                  {n.comandaId && (
                    <button type="button" onClick={() => abrir(n)} className="inline-flex h-14 items-center gap-1.5 rounded-md border border-line bg-elevated px-4 text-[15px] font-semibold shadow-xs hover:bg-surface focus-visible:shadow-focus">
                      Ver comanda <Icon name="chevron-right" size={18} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
