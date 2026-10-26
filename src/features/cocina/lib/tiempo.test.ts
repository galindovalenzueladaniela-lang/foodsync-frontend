import { describe, expect, it } from 'vitest';
import { minutosDesde, textoMinutos, tonoTiempo } from './tiempo';

describe('tiempo de la comanda', () => {
  it('pasa a miel a los 15 minutos y a paprika a los 25', () => {
    expect(tonoTiempo(0)).toBe('normal');
    expect(tonoTiempo(14)).toBe('normal');
    expect(tonoTiempo(15)).toBe('miel');
    expect(tonoTiempo(24)).toBe('miel');
    expect(tonoTiempo(25)).toBe('paprika');
    expect(tonoTiempo(90)).toBe('paprika');
  });

  it('cuenta minutos completos y nunca negativos', () => {
    const ahora = Date.parse('2026-10-26T21:48:30Z');
    expect(minutosDesde('2026-10-26T21:36:31Z', ahora)).toBe(11);
    expect(minutosDesde('2026-10-26T21:36:30Z', ahora)).toBe(12);
    expect(minutosDesde('2026-10-26T21:50:00Z', ahora)).toBe(0);
  });

  it('muestra horas cuando pasa de 60 minutos', () => {
    expect(textoMinutos(12)).toBe('12 min');
    expect(textoMinutos(65)).toBe('1 h 05 min');
  });
});
