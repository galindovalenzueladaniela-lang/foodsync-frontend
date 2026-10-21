export interface Cuenta {
  subtotal: number;
  impuestos: number;
  propina: number;
  total: number;
}

export type Propina = { tipo: 'porcentaje'; valor: number } | { tipo: 'monto'; valor: number };

/**
 * RF11: total = subtotal + impuestos + propina.
 * Los precios de la carta ya incluyen impuestos, así que el subtotal se obtiene descontándolos del consumo.
 * La propina sugerida se calcula sobre el consumo (lo que el comensal ve en la carta).
 */
export function calcularCuenta(consumo: number, tasaImpuesto: number, propina: Propina): Cuenta {
  const subtotal = Math.round(consumo / (1 + tasaImpuesto));
  const impuestos = consumo - subtotal;
  const montoPropina = propina.tipo === 'porcentaje' ? Math.round((consumo * propina.valor) / 100) : Math.max(0, Math.round(propina.valor));
  return { subtotal, impuestos, propina: montoPropina, total: consumo + montoPropina };
}
