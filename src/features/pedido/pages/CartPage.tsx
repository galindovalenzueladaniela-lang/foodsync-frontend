import { useState } from 'react';
import { rutas } from '../../../app/rutas';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { QuantityStepper } from '../../../shared/ui/QuantityStepper';
import { RoundIconButton } from '../../../shared/ui/RoundIconButton';
import { crearPedido } from '../../../services/pedidoService';
import type { LineaPedido } from '../../../services/types';
import { lugarMesa, useMesa } from '../../mesa/context/MesaContext';
import { useCart } from '../cart/CartContext';
import { detalleLinea, importeLinea } from '../cart/cartReducer';

/* Paso 5 · Tu pedido: productos, cantidades, observaciones y total; se envía directo a cocina (RF7). */
export function CartPage() {
  const { ctx, money } = useMesa();
  const { lineas, platos, total, dispatch } = useCart();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    setError(false);
    try {
      const payload: LineaPedido[] = lineas.map((l) => ({
        productoId: l.producto.id, nombre: l.producto.nombre, cantidad: l.cantidad, varianteId: l.varianteId,
        extrasIds: l.extrasIds, detalle: detalleLinea(l), observaciones: l.observaciones, importe: importeLinea(l), area: l.producto.area,
      }));
      const pedido = await crearPedido(ctx.token, payload);
      dispatch({ type: 'vaciar' });
      navigate(rutas.confirmacion(ctx.token, pedido.id), { replace: true });
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  const vacio = lineas.length === 0;

  return (
    <Screen
      className="gap-4 px-4 pb-4 pt-5"
      footer={!vacio && (
        <div className="flex flex-col gap-2.5">
          <div className="floating flex flex-col gap-1.5 rounded-lg px-4 py-3.5">
            <div className="flex justify-between text-[13px] text-ink-secondary">
              <span>{platos === 1 ? '1 plato' : `${platos} platos`}</span><span>Impuestos incluidos</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">Total</span>
              <span className="display text-[34px] leading-9 tabular-nums">{money(total)}</span>
            </div>
          </div>
          <Button block onClick={enviar} disabled={enviando}>
            <Icon name="cocina" size={18} /> {enviando ? 'Enviando…' : 'Enviar pedido a cocina'}
          </Button>
          <p className={error ? 'text-center text-xs font-semibold text-error-text' : 'text-center text-[11px] text-ink-secondary'} role={error ? 'alert' : undefined}>
            {error ? 'No pudimos enviar tu pedido. Inténtalo de nuevo.' : 'La cocina lo recibe al instante y tú verás su estado aquí.'}
          </p>
        </div>
      )}
    >
      <header className="flex items-start gap-3">
        <RoundIconButton icon="cerrar" aria-label="Volver al menú" onClick={() => navigate(rutas.menu(ctx.token))} />
        <div className="flex flex-col">
          <h1 className="display text-[30px] leading-8">Tu pedido</h1>
          <p className="text-[13px] text-ink-secondary">{lugarMesa(ctx)} · para comer aquí</p>
        </div>
      </header>

      {vacio ? (
        <div className="card flex flex-col items-center gap-3 px-5 py-8 text-center">
          <span className="text-primary"><Icon name="carrito" size={28} /></span>
          <p className="display text-2xl">Tu pedido está vacío</p>
          <p className="text-sm text-ink-secondary">Elige algo de la carta y aparecerá aquí.</p>
          <Button variant="secondary" size="md" onClick={() => navigate(rutas.menu(ctx.token))}>Ver el menú</Button>
        </div>
      ) : (
        <>
          <ul className="card flex flex-col divide-y divide-line-subtle px-4">
            {lineas.map((l) => (
              <li key={l.id} className="flex flex-col gap-1 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="display text-xl leading-6">{l.producto.nombre}</h2>
                  <span className="text-[15px] font-semibold tabular-nums">{money(importeLinea(l))}</span>
                </div>
                {detalleLinea(l) && <p className="text-[13px] text-ink-secondary">{detalleLinea(l)}</p>}
                {l.observaciones && <p className="text-[13px] italic text-[#9A6A2E]">«{l.observaciones}»</p>}
                <div className="mt-1.5 flex items-center justify-between">
                  <Button variant="ghost" size="md" className="-ml-3 h-8 px-3 text-[13px]" onClick={() => navigate(rutas.producto(ctx.token, l.producto.id, l.id))}>
                    <Icon name="editar" size={14} /> Editar
                  </Button>
                  <QuantityStepper
                    removable label={`Cantidad de ${l.producto.nombre}`} value={l.cantidad}
                    onChange={(n) => dispatch({ type: 'cantidad', id: l.id, cantidad: n })}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="md" onClick={() => navigate(rutas.menu(ctx.token))}>
            <Icon name="agregar" size={16} /> Agregar algo más
          </Button>
        </>
      )}
    </Screen>
  );
}
