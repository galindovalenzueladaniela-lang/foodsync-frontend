import { describe, expect, it } from 'vitest';
import { menuDemo } from '../../../services/mock/data';
import { cartReducer, detalleLinea, importeLinea, totalCarrito } from './cartReducer';

const risotto = menuDemo.productos.find((p) => p.id === 'risotto')!;
const pesca = menuDemo.productos.find((p) => p.id === 'pesca')!;

describe('cartReducer', () => {
  it('calcula importes con variante y extras como en el diseño', () => {
    let s = cartReducer([], { type: 'agregar', producto: risotto, seleccion: { varianteId: 'individual', extrasIds: ['parmesano'] }, observaciones: 'Sin cebolla en uno, por favor.', cantidad: 2 });
    s = cartReducer(s, { type: 'agregar', producto: pesca, seleccion: { varianteId: 'coliflor', extrasIds: [] }, observaciones: '', cantidad: 1 });
    expect(importeLinea(s[0])).toBe(420);
    expect(detalleLinea(s[0])).toBe('Porción individual · Parmesano extra');
    expect(totalCarrito(s)).toBe(665);
  });

  it('suma cantidades si la selección es idéntica y separa si cambia', () => {
    const sel = { varianteId: 'individual', extrasIds: [] };
    let s = cartReducer([], { type: 'agregar', producto: risotto, seleccion: sel, observaciones: '', cantidad: 1 });
    s = cartReducer(s, { type: 'agregar', producto: risotto, seleccion: sel, observaciones: '', cantidad: 1 });
    expect(s).toHaveLength(1);
    expect(s[0].cantidad).toBe(2);
    s = cartReducer(s, { type: 'agregar', producto: risotto, seleccion: { varianteId: 'compartir', extrasIds: [] }, observaciones: '', cantidad: 1 });
    expect(s).toHaveLength(2);
  });

  it('quita la línea cuando la cantidad llega a cero', () => {
    const s = cartReducer([], { type: 'agregar', producto: pesca, seleccion: { varianteId: 'coliflor', extrasIds: [] }, observaciones: '', cantidad: 1 });
    expect(cartReducer(s, { type: 'cantidad', id: s[0].id, cantidad: 0 })).toEqual([]);
  });
});
