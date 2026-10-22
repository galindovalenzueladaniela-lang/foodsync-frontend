import { describe, expect, it } from 'vitest';
import { calcularCuenta } from './calcularCuenta';

describe('calcularCuenta', () => {
  it('desglosa en centavos (consumo $665.00, IVA 8 % incluido, propina 10 %)', () => {
    expect(calcularCuenta(665, 0.08, { tipo: 'porcentaje', valor: 10 })).toEqual({
      subtotal: 615.74, impuestos: 49.26, propina: 66.5, total: 731.5,
    });
  });

  it('acepta propina cero y monto libre', () => {
    expect(calcularCuenta(665, 0.08, { tipo: 'porcentaje', valor: 0 }).total).toBe(665);
    expect(calcularCuenta(665, 0.08, { tipo: 'monto', valor: 50.5 }).total).toBe(715.5);
    expect(calcularCuenta(665, 0.08, { tipo: 'monto', valor: -5 }).propina).toBe(0);
  });
});
