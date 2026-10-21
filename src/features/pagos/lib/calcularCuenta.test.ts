import { describe, expect, it } from 'vitest';
import { calcularCuenta } from './calcularCuenta';

describe('calcularCuenta', () => {
  it('reproduce el desglose del diseño (consumo 150.000, IVA 8 % incluido, propina 10 %)', () => {
    expect(calcularCuenta(150_000, 0.08, { tipo: 'porcentaje', valor: 10 })).toEqual({
      subtotal: 138_889, impuestos: 11_111, propina: 15_000, total: 165_000,
    });
  });

  it('acepta propina cero y monto libre', () => {
    expect(calcularCuenta(150_000, 0.08, { tipo: 'porcentaje', valor: 0 }).total).toBe(150_000);
    expect(calcularCuenta(150_000, 0.08, { tipo: 'monto', valor: 7_000 }).total).toBe(157_000);
    expect(calcularCuenta(150_000, 0.08, { tipo: 'monto', valor: -5 }).propina).toBe(0);
  });
});
