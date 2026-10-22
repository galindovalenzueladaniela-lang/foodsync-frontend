import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { ChoiceRow } from '../../../shared/ui/ChoiceRow';
import { Icon } from '../../../shared/ui/Icon';
import { SectionLabel } from '../../../shared/ui/SectionLabel';
import { cn } from '../../../shared/lib/cn';
import { horaCorta } from '../../../shared/lib/time';
import { pedidosDeMesa } from '../../../services/pedidoService';
import { pagarCuenta, solicitarCuenta } from '../../../services/pagoService';
import type { MetodoPago, Pedido } from '../../../services/types';
import { lugarMesa, useMesa } from '../../mesa/context/MesaContext';
import { PagoConfirmado } from '../components/PagoConfirmado';
import { calcularCuenta, type Propina } from '../lib/calcularCuenta';
import type { Comprobante } from '../lib/comprobante';

/* RF11: Original Pay registra pagos digitales, en efectivo, con tarjeta o por transferencia. */
const METODOS: Array<{ id: MetodoPago; nombre: string; detalle: string; accion: string }> = [
  { id: 'original_pay', nombre: 'Pago digital', detalle: 'Original Pay', accion: 'con Original Pay' },
  { id: 'efectivo', nombre: 'Efectivo', detalle: 'Al personal', accion: 'en efectivo' },
  { id: 'terminal', nombre: 'Terminal', detalle: 'Tarjeta bancaria', accion: 'con tarjeta' },
  { id: 'transferencia', nombre: 'Transferencia', detalle: 'Bancaria', accion: 'por transferencia' },
];

type Resultado = null | { tipo: 'pagado'; comprobante: Comprobante } | { tipo: 'aviso' };

/* Paso 8 · Pago y propina: desglose, propina sugerida, método y pago con Original Pay. */
export function PaymentPage() {
  const { ctx, money } = useMesa();
  const r = ctx.restaurante;
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [propina, setPropina] = useState<Propina>({ tipo: 'porcentaje', valor: r.propinasSugeridas[0] ?? 0 });
  const [otroMonto, setOtroMonto] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago>('original_pay');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);
  const navigate = useNavigate();

  useEffect(() => {
    solicitarCuenta(ctx.token);
    pedidosDeMesa(ctx.token).then(setPedidos);
  }, [ctx.token]);

  // RF6: la cuenta suma todos los pedidos de la mesa.
  const consumo = pedidos?.reduce((s, p) => s + p.total, 0) ?? 0;
  const cuenta = calcularCuenta(consumo, r.tasaImpuesto, propina);
  const m = METODOS.find((x) => x.id === metodo)!;
  const numeros = pedidos?.map((p) => `#${p.numero}`).join(', ');

  const pagar = async () => {
    setEnviando(true);
    try {
      const res = await pagarCuenta({ mesaToken: ctx.token, pedidoIds: pedidos?.map((p) => p.id) ?? [], propina: cuenta.propina, metodo });
      if (res.tipo === 'redireccion' && !res.url.startsWith('#')) window.location.href = res.url;
      else setResultado(res.tipo === 'redireccion' ? { tipo: 'pagado', comprobante: armarComprobante() } : { tipo: 'aviso' });
    } finally {
      setEnviando(false);
    }
  };

  const filas: Array<[string, number]> = [
    ['Subtotal', cuenta.subtotal],
    [`Impuestos (${Math.round(r.tasaImpuesto * 100)} %)`, cuenta.impuestos],
    ['Propina', cuenta.propina],
  ];

  // Lo que se pagó, tal como queda en el comprobante.
  function armarComprobante(): Comprobante {
    const emitido = new Date();
    const dia = new Intl.DateTimeFormat(r.locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(emitido);
    return {
      restaurante: r.nombre,
      lugar: lugarMesa(ctx, { conSucursal: true }),
      fecha: `${dia} · ${horaCorta(emitido.toISOString())}`,
      pedidos: numeros ?? '',
      filas: filas.map(([label, valor]) => [label, money(valor)]),
      total: money(cuenta.total),
      metodo: `${m.nombre} · ${m.detalle}`,
      emitido,
    };
  }

  if (resultado?.tipo === 'pagado') {
    return <PagoConfirmado comprobante={resultado.comprobante} onVolver={() => navigate(rutas.menu(ctx.token))} />;
  }

  return (
    <Screen
      className="gap-4 px-4 pb-4 pt-5"
      footer={
        resultado ? (
          <div role="status" className="floating aviso-entra flex items-center gap-3 rounded-lg px-4 py-3.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text"><Icon name="check" size={18} strokeWidth={2} /></span>
            <p className="text-sm">
              <b className="font-semibold">Avisamos al personal.</b> En un momento llegan a tu mesa para cobrar {m.accion}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button block onClick={pagar} disabled={!pedidos?.length || enviando}>
              {metodo === 'original_pay' && <Icon name="pagos" size={18} />}
              {enviando ? 'Procesando…' : metodo === 'original_pay' ? `Pagar ${money(cuenta.total)} con Original Pay` : `Pedir cobro ${m.accion} · ${money(cuenta.total)}`}
            </Button>
            <p className="text-center text-[11px] leading-4 text-ink-secondary">
              {metodo === 'original_pay' ? 'El pago se confirma al instante y recibes tu comprobante aquí.' : 'El personal registra el pago en el sistema al cobrarte.'}
            </p>
          </div>
        )
      }
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="display text-[30px] leading-8">La cuenta</h1>
          <p className="text-[13px] leading-[18px] text-ink-secondary">Mesa {ctx.mesa.numero}{numeros && ` · Pedido ${numeros}`}</p>
        </div>
        <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-text">Pago solicitado</span>
      </header>

      <section aria-label="Desglose" className="card flex flex-col gap-2 p-4 text-sm">
        {filas.map(([label, valor]) => (
          <div key={label} className="flex justify-between"><span>{label}</span><span className="tabular-nums">{money(valor)}</span></div>
        ))}
        <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-[#E1D6C8] pt-2">
          <span className="font-semibold">Total</span>
          <span className="display text-[34px] leading-9 tabular-nums">{money(cuenta.total)}</span>
        </div>
      </section>

      <fieldset className="flex flex-col gap-2" disabled={!!resultado}>
        <div className="flex items-center justify-between">
          <SectionLabel as="legend" className="float-left">Propina sugerida</SectionLabel>
          {/* RF11: además de los porcentajes, monto libre. */}
          <button type="button" onClick={() => { setOtroMonto(true); setPropina({ tipo: 'monto', valor: cuenta.propina }); }}
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline">Otro monto</button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, ...r.propinasSugeridas].map((pct) => {
            const activo = !otroMonto && propina.tipo === 'porcentaje' && propina.valor === pct;
            return (
              <button
                key={pct} type="button" aria-pressed={activo}
                onClick={() => { setOtroMonto(false); setPropina({ tipo: 'porcentaje', valor: pct }); }}
                className={cn('h-10 rounded-md border-[1.5px] text-[13px] font-semibold transition', activo ? 'border-primary bg-primary-soft text-primary' : 'border-[#E1D6C8] bg-elevated text-[#4E4239] hover:bg-surface')}
              >
                {pct === 0 ? 'Ninguna' : `${pct} %`}
              </button>
            );
          })}
        </div>
        {otroMonto && (
          <label className="flex h-10 items-center gap-2 rounded-md border-[1.5px] border-primary bg-elevated px-3 text-sm">
            <span className="text-ink-secondary">Propina</span>
            <input
              type="number" inputMode="decimal" min={0} step="any" autoFocus
              value={propina.valor} onChange={(e) => setPropina({ tipo: 'monto', valor: Number(e.target.value) || 0 })}
              className="min-w-0 flex-1 bg-transparent text-right tabular-nums focus:outline-none"
            />
          </label>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={!!resultado}>
        <SectionLabel as="legend" className="mb-2">Método de pago</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {METODOS.map((x) => (
            <ChoiceRow
              key={x.id} type="radio" name="metodo" className={cn('h-12 text-[13px] font-semibold', metodo === x.id && 'text-primary')}
              checked={metodo === x.id} onChange={() => setMetodo(x.id)} label={x.nombre} hint={x.detalle}
            />
          ))}
        </div>
      </fieldset>
    </Screen>
  );
}
