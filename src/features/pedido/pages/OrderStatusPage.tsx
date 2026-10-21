import { useNavigate, useParams } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { minutosDesde } from '../../../shared/lib/time';
import type { EstadoPedido } from '../../../services/types';
import { useMesa } from '../../mesa/context/MesaContext';
import { EstadoTimeline } from '../components/EstadoTimeline';
import { useAhora, usePedido } from '../hooks/usePedido';
import { useAvisoEstado } from '../hooks/useAvisoEstado';

const TITULOS: Record<EstadoPedido, { aviso: string; antes: string; enfasis: string; color: string }> = {
  pendiente: { aviso: 'Tu pedido llegó a cocina', antes: 'Ya lo', enfasis: 'recibimos', color: 'text-warning-text' },
  en_preparacion: { aviso: 'Tu pedido está en preparación', antes: 'Ya lo están', enfasis: 'cocinando', color: 'text-[#9A4A24]' },
  listo: { aviso: 'Tu pedido está listo', antes: 'Ya va', enfasis: 'en camino', color: 'text-success-text' },
  entregado: { aviso: 'Tu pedido fue entregado', antes: '¡Buen', enfasis: 'provecho!', color: 'text-primary' },
  cancelado: { aviso: 'Tu pedido fue cancelado', antes: 'Pedido', enfasis: 'cancelado', color: 'text-error-text' },
};

const fondoAviso: Record<EstadoPedido, string> = {
  pendiente: 'bg-warning-soft text-warning-text',
  en_preparacion: 'bg-[#F7E4D8] text-[#9A4A24]',
  listo: 'bg-success-soft text-success-text',
  entregado: 'bg-[#EFE8DF] text-[#6B5E54]',
  cancelado: 'bg-error-soft text-error-text',
};

/* Paso 7 · Estado del pedido: estados posibles, tiempo transcurrido y aviso del último cambio (RF7). */
export function OrderStatusPage() {
  const { pedidoId = '' } = useParams();
  const { ctx } = useMesa();
  const { pedido, error } = usePedido(pedidoId);
  const ahora = useAhora();
  const navigate = useNavigate();
  useAvisoEstado(pedido?.estado);

  if (!pedido) {
    return <Screen><p className="p-6 text-sm text-ink-secondary">{error ? 'No encontramos este pedido.' : 'Cargando tu pedido…'}</p></Screen>;
  }

  const t = TITULOS[pedido.estado];
  const ultimo = pedido.historial[pedido.historial.length - 1];
  const haceMin = minutosDesde(ultimo.en, ahora);
  const lleva = minutosDesde(pedido.creadoEn, ahora);

  return (
    <Screen
      className="gap-4 px-4 pb-4 pt-5"
      footer={
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => navigate(rutas.menu(ctx.token))}>Pedir algo más</Button>
          {/* RF7: solicitar la cuenta al terminar. */}
          <Button className="flex-1" onClick={() => navigate(rutas.cuenta(ctx.token))}>
            <Icon name="pagos" size={18} /> Pagar
          </Button>
        </div>
      }
    >
      {/* Notificación del último cambio: con key = estado se vuelve a animar cada vez que la cocina lo cambia. */}
      <div key={pedido.estado} role="status" className="floating aviso-entra relative flex items-center gap-3 overflow-hidden rounded-lg px-3.5 py-3">
        <span aria-hidden="true" className="aviso-brillo pointer-events-none absolute inset-0" />
        <span className={`relative inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${fondoAviso[pedido.estado]}`}>
          <span aria-hidden="true" className="aviso-pulso absolute inset-0 rounded-full" />
          <Icon name="notificaciones" size={18} className="aviso-campana block shrink-0" />
        </span>
        <div className="relative flex flex-col">
          <span className="text-sm font-semibold leading-[18px]">{t.aviso}</span>
          <span className="text-xs leading-4 text-ink-secondary">{ctx.restaurante.nombre} · {haceMin < 1 ? 'ahora' : `hace ${haceMin} min`}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-col">
        <span className="text-[13px] leading-[18px] text-ink-secondary">Pedido #{pedido.numero} · Mesa {ctx.mesa.numero}</span>
        <h1 className="display text-[34px] leading-9">
          {t.antes} <em className={t.color}>{t.enfasis}</em>
        </h1>
      </div>
      {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
        <p className="flex items-center gap-2 text-sm text-[#4E4239]">
          <Icon name="reloj" size={18} /> Lleva {lleva === 1 ? '1 minuto' : `${lleva} minutos`}
        </p>
      )}

      <EstadoTimeline pedido={pedido} />
    </Screen>
  );
}
