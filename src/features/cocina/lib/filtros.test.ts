import { describe, expect, it } from 'vitest';
import type { Comanda, EstadoPedido } from '../../../services/types';
import { columnas, columnasVisibles, contarPorEstado, entregadasRecientes, filtrarHistorial } from './filtros';

const c = (numero: string, estado: EstadoPedido, area: Comanda['area'], extra: Partial<Comanda> = {}): Comanda => ({
  id: `ped_${numero}-${area}`, pedidoId: `ped_${numero}`, numero, mesa: `Mesa ${Number(numero) % 20}`, canal: 'qr', area, estado,
  creadoEn: `2026-10-26T21:${numero.slice(-2)}:00Z`, historial: [{ estado, en: `2026-10-26T21:${numero.slice(-2)}:30Z` }],
  lineas: [{ indice: 0, nombre: 'Risotto de hongos', cantidad: 2, detalle: '', observaciones: '' }], ...extra,
});

const lista = [
  c('0421', 'pendiente', 'caliente'),
  c('0420', 'pendiente', 'fria', { canal: 'para_llevar', mesa: 'Para llevar', lineas: [{ indice: 0, nombre: 'Burrata con tomates asados', cantidad: 2, detalle: '', observaciones: '' }] }),
  c('0418', 'en_preparacion', 'caliente'),
  c('0419', 'en_preparacion', 'barra', { canal: 'mesero' }),
  c('0417', 'listo', 'fria', { canal: 'mesero' }),
  c('0412', 'entregado', 'fria'),
  c('0413', 'entregado', 'caliente'),
  c('0411', 'cancelado', 'caliente'),
];

describe('filtros del KDS', () => {
  it('reparte por columnas y filtra por área', () => {
    const todas = columnas(lista, 'todas');
    expect(todas.pendiente.map((x) => x.numero)).toEqual(['0421', '0420']);
    expect(todas.en_preparacion).toHaveLength(2);
    expect(todas.listo).toHaveLength(1);
    expect(columnas(lista, 'caliente').pendiente.map((x) => x.numero)).toEqual(['0421']);
    expect(columnas(lista, 'barra').en_preparacion.map((x) => x.numero)).toEqual(['0419']);
  });

  it('los contadores siguen al área y no cuentan entregadas ni canceladas', () => {
    expect(contarPorEstado(lista, 'todas')).toEqual({ pendiente: 2, en_preparacion: 2, listo: 1 });
    expect(contarPorEstado(lista, 'fria')).toEqual({ pendiente: 1, en_preparacion: 0, listo: 1 });
  });

  it('un contador elegido deja una sola columna', () => {
    expect(columnasVisibles(null)).toEqual(['pendiente', 'en_preparacion', 'listo']);
    expect(columnasVisibles('listo')).toEqual(['listo']);
  });

  it('entregados hace poco: la más reciente primero', () => {
    expect(entregadasRecientes(lista, 'todas').map((x) => x.numero)).toEqual(['0413', '0412']);
    expect(entregadasRecientes(lista, 'fria').map((x) => x.numero)).toEqual(['0412']);
  });

  it('historial: busca sin acentos y combina estado, área y canal', () => {
    const base = { texto: '', estado: 'todos', area: 'todas', canal: 'todos' } as const;
    expect(filtrarHistorial(lista, base)).toHaveLength(8);
    expect(filtrarHistorial(lista, { ...base, texto: 'burrata' }).map((x) => x.numero)).toEqual(['0420']);
    expect(filtrarHistorial(lista, { ...base, texto: 'cocina fria' }).map((x) => x.numero)).toEqual(['0420', '0417', '0412']);
    expect(filtrarHistorial(lista, { ...base, texto: '#0418' }).map((x) => x.numero)).toEqual(['0418']);
    expect(filtrarHistorial(lista, { ...base, estado: 'cancelado' }).map((x) => x.numero)).toEqual(['0411']);
    expect(filtrarHistorial(lista, { ...base, canal: 'mesero', area: 'barra' }).map((x) => x.numero)).toEqual(['0419']);
  });
});
