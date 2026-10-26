import { beforeEach, describe, expect, it } from 'vitest';
import type { EventoTiempoReal, LineaPedido } from '../types';
import * as store from './cocinaStore';
import { DEMO_TOKEN } from './data';

const linea = (nombre: string, area: LineaPedido['area'], importe: number): LineaPedido => ({
  productoId: nombre, nombre, cantidad: 1, extrasIds: [], detalle: '', observaciones: '', importe, area,
});

describe('mock compartido cliente ↔ cocina', () => {
  beforeEach(() => store.reiniciar());

  it('siembra el turno del diseño: 2 pendientes, 3 en preparación y 2 listos', () => {
    const activas = store.comandas().filter((c) => ['pendiente', 'en_preparacion', 'listo'].includes(c.estado));
    expect(activas.filter((c) => c.estado === 'pendiente')).toHaveLength(2);
    expect(activas.filter((c) => c.estado === 'en_preparacion')).toHaveLength(3);
    expect(activas.filter((c) => c.estado === 'listo')).toHaveLength(2);
    expect(store.pedidosDeMesa(DEMO_TOKEN).map((p) => p.numero)).toEqual(['0418']);
  });

  it('el pedido del cliente llega a cocina separado por área y avisa', () => {
    const eventos: EventoTiempoReal[] = [];
    const dejar = store.suscribir((e) => eventos.push(e));
    const p = store.crearPedidoCliente(DEMO_TOKEN, [linea('Risotto de hongos', 'caliente', 185), linea('Limonada de hierbabuena', 'barra', 45)]);
    dejar();

    expect(p.numero).toBe('0422');
    const suyas = store.comandas().filter((c) => c.pedidoId === p.id);
    expect(suyas.map((c) => [c.area, c.estado, c.mesa])).toEqual([['caliente', 'pendiente', 'Mesa 7'], ['barra', 'pendiente', 'Mesa 7']]);
    expect(eventos).toEqual([{ tipo: 'pedido.creado', pedidoId: p.id, comandaIds: [`${p.id}-caliente`, `${p.id}-barra`] }]);
    expect(store.notificaciones()[0]).toMatchObject({ tipo: 'nuevo_pedido', titulo: 'Nuevo pedido · Mesa 7', leida: false });
  });

  it('los cambios de estado de cocina actualizan el pedido del comensal', () => {
    const p = store.crearPedidoCliente(DEMO_TOKEN, [linea('Risotto de hongos', 'caliente', 185), linea('Limonada de hierbabuena', 'barra', 45)]);
    const estado = () => store.pedidoCliente(p.id)!.estado;

    store.cambiarEstadoComanda(`${p.id}-barra`, 'en_preparacion');
    expect(estado()).toBe('en_preparacion');
    store.cambiarEstadoComanda(`${p.id}-barra`, 'listo');
    expect(estado()).toBe('en_preparacion');
    store.cambiarEstadoComanda(`${p.id}-caliente`, 'en_preparacion');
    store.cambiarEstadoComanda(`${p.id}-caliente`, 'listo');
    expect(estado()).toBe('listo');
    store.cambiarEstadoComanda(`${p.id}-caliente`, 'entregado');
    store.cambiarEstadoComanda(`${p.id}-barra`, 'entregado');
    expect(store.pedidoCliente(p.id)!.historial.map((h) => h.estado)).toEqual(['pendiente', 'en_preparacion', 'listo', 'entregado']);
  });

  it('cancelar un platillo lo saca de la cuenta y, si era el único del área, cancela la comanda', () => {
    const p = store.crearPedidoCliente(DEMO_TOKEN, [linea('Risotto de hongos', 'caliente', 185), linea('Limonada de hierbabuena', 'barra', 45)]);
    const c = store.cancelarLinea(`${p.id}-barra`, 1, 'Falta de ingredientes: sin hierbabuena');
    expect(c.estado).toBe('cancelado');
    expect(c.lineas[0].cancelada?.motivo).toBe('Falta de ingredientes: sin hierbabuena');
    expect(store.pedidoCliente(p.id)!.total).toBe(185);
    expect(store.pedidoCliente(p.id)!.estado).toBe('pendiente');
    expect(store.notificaciones()[0]).toMatchObject({ tipo: 'cancelacion', detalle: '1× Limonada de hierbabuena · Falta de ingredientes: sin hierbabuena' });
  });

  it('avisa una sola vez cuando una comanda pasa de 25 minutos sin estar lista', () => {
    const mas2 = Date.now() + 2 * 60_000;
    expect(store.registrarRetrasos(mas2)).toBe(1); // Mesa 11 llevaba 24 min
    expect(store.registrarRetrasos(mas2)).toBe(0);
    expect(store.notificaciones()[0]).toMatchObject({ tipo: 'retraso', titulo: 'Retraso · Mesa 11' });
  });

  it('marca notificaciones como leídas', () => {
    expect(store.notificaciones().filter((n) => !n.leida)).toHaveLength(1);
    store.marcarLeidas('todas');
    expect(store.notificaciones().filter((n) => !n.leida)).toHaveLength(0);
  });
});
