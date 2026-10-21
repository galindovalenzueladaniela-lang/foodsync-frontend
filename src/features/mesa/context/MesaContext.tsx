import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolverMesa } from '../../../services/mesaService';
import type { MesaContexto } from '../../../services/types';
import { formatMoney } from '../../../shared/lib/money';

interface MesaValue {
  ctx: MesaContexto;
  /** Formatea montos con la moneda del restaurante. */
  money: (n: number) => string;
}

const Ctx = createContext<MesaValue | null>(null);

type Estado = { tipo: 'cargando' } | { tipo: 'error' } | { tipo: 'listo'; ctx: MesaContexto };

export function useMesaToken(token: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  useEffect(() => {
    let vivo = true;
    setEstado({ tipo: 'cargando' });
    resolverMesa(token)
      .then((ctx) => vivo && setEstado({ tipo: 'listo', ctx }))
      .catch(() => vivo && setEstado({ tipo: 'error' }));
    return () => { vivo = false; };
  }, [token]);
  return estado;
}

export function MesaProvider({ ctx, children }: { ctx: MesaContexto; children: ReactNode }) {
  const value = useMemo<MesaValue>(() => {
    const { locale, currency } = ctx.restaurante;
    return { ctx, money: (n) => formatMoney(n, { locale, currency }) };
  }, [ctx]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMesa(): MesaValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMesa debe usarse dentro de <MesaProvider>');
  return v;
}

/** Texto corto "Mesa 7 · Terraza · Sucursal Centro". */
export function lugarMesa(ctx: MesaContexto, opts: { conSucursal?: boolean } = {}) {
  const partes = [`Mesa ${ctx.mesa.numero}`, ctx.mesa.area];
  if (opts.conSucursal) partes.push(ctx.sucursal.nombre);
  return partes.join(' · ');
}
