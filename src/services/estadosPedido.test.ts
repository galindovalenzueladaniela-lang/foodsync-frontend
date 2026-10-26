import { describe, expect, it } from 'vitest';
import { estadoDelPedido, siguienteEstado } from './estadosPedido';

describe('estados del pedido (cliente y cocina)', () => {
  it('el botón de la comanda avanza un paso a la vez', () => {
    expect(siguienteEstado('pendiente')).toBe('en_preparacion');
    expect(siguienteEstado('en_preparacion')).toBe('listo');
    expect(siguienteEstado('listo')).toBe('entregado');
    expect(siguienteEstado('entregado')).toBeNull();
    expect(siguienteEstado('cancelado')).toBeNull();
  });

  it('el pedido del comensal resume sus comandas por área', () => {
    expect(estadoDelPedido(['pendiente'])).toBe('pendiente');
    expect(estadoDelPedido(['pendiente', 'en_preparacion'])).toBe('en_preparacion');
    expect(estadoDelPedido(['listo', 'en_preparacion'])).toBe('en_preparacion');
    expect(estadoDelPedido(['listo', 'listo'])).toBe('listo');
    expect(estadoDelPedido(['entregado', 'listo'])).toBe('listo');
    expect(estadoDelPedido(['entregado', 'entregado'])).toBe('entregado');
  });

  it('las comandas canceladas no detienen al resto', () => {
    expect(estadoDelPedido(['cancelado', 'listo'])).toBe('listo');
    expect(estadoDelPedido(['cancelado', 'cancelado'])).toBe('cancelado');
  });
});
