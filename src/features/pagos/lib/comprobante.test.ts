import { describe, expect, it } from 'vitest';
import { nombreArchivo, type Comprobante } from './comprobante';

const base: Comprobante = {
  restaurante: 'Casa Olivo', lugar: 'Mesa 7', fecha: '', pedidos: '#0418', filas: [], total: '$ 1', metodo: 'Pago digital', emitido: new Date(2026, 9, 21, 9, 5),
};

describe('nombreArchivo', () => {
  it('usa el restaurante sin acentos y la fecha de emisión', () => {
    expect(nombreArchivo(base)).toBe('comprobante-casa-olivo-20261021-0905.png');
    expect(nombreArchivo({ ...base, restaurante: 'Café Ñandú & Co.' })).toBe('comprobante-cafe-nandu-co-20261021-0905.png');
  });
});
