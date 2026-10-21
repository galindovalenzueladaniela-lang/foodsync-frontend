import { useNavigate, useParams } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { horaCorta } from '../../../shared/lib/time';
import { useMesa } from '../../mesa/context/MesaContext';
import { EstadoPill } from '../components/EstadoPill';
import { usePedido } from '../hooks/usePedido';

/* Paso 6 · Confirmación: número de pedido y estado inicial Pendiente. */
export function ConfirmationPage() {
  const { pedidoId = '' } = useParams();
  const { ctx, money } = useMesa();
  const { pedido } = usePedido(pedidoId, 0);
  const navigate = useNavigate();
  const platos = pedido?.lineas.reduce((s, l) => s + l.cantidad, 0) ?? 0;

  return (
    <Screen
      className="items-center gap-6 px-5 pt-16 text-center"
      footer={
        <div className="flex flex-col gap-1">
          <Button block onClick={() => navigate(rutas.estado(ctx.token, pedidoId), { replace: true })}>Ver estado del pedido</Button>
          <Button block variant="ghost" onClick={() => navigate(rutas.menu(ctx.token))}>Volver al menú</Button>
        </div>
      }
    >
      <span className="mt-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-success-soft text-success-text shadow-[0_0_0_12px_rgba(227,238,227,0.5),0_0_0_24px_rgba(227,238,227,0.25)]">
        <Icon name="check" size={50} strokeWidth={1.8} />
      </span>
      <div className="flex flex-col gap-2 pt-4">
        <h1 className="display text-[40px] leading-[42px]">¡Pedido <em className="text-primary">recibido!</em></h1>
        <p className="text-[15px] leading-[22px] text-ink-secondary">La cocina ya tiene tu pedido.<br />Te avisaremos aquí cuando cambie de estado.</p>
      </div>
      {pedido && (
        <section className="flex w-full flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-[18px] text-left shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl leading-[26px]">Pedido #{pedido.numero}</h2>
            <EstadoPill estado={pedido.estado} />
          </div>
          <div className="flex justify-between text-sm text-ink-secondary">
            <span>Mesa {ctx.mesa.numero} · {platos === 1 ? '1 plato' : `${platos} platos`}</span>
            <span>{horaCorta(pedido.creadoEn)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-dashed border-line pt-2">
            <span className="text-[15px] font-semibold">Total</span>
            <span className="display text-[30px] leading-8 tabular-nums">{money(pedido.total)}</span>
          </div>
        </section>
      )}
    </Screen>
  );
}
