import type { Producto } from '../../../services/types';
import { detalleSeleccion, precioUnitario, type Seleccion } from './precio';

export interface LineaCarrito extends Seleccion {
  id: string;
  producto: Producto;
  observaciones: string;
  cantidad: number;
}

export type CartAction =
  | { type: 'agregar'; producto: Producto; seleccion: Seleccion; observaciones: string; cantidad: number }
  | { type: 'actualizar'; id: string; seleccion: Seleccion; observaciones: string; cantidad: number }
  | { type: 'cantidad'; id: string; cantidad: number }
  | { type: 'vaciar' };

const mismaSeleccion = (a: LineaCarrito, p: Producto, s: Seleccion, obs: string) =>
  a.producto.id === p.id && a.varianteId === s.varianteId && a.observaciones === obs &&
  a.extrasIds.length === s.extrasIds.length && a.extrasIds.every((x) => s.extrasIds.includes(x));

let seq = 0;
const nuevoId = () => `l${Date.now().toString(36)}${(seq++).toString(36)}`;

export function cartReducer(state: LineaCarrito[], action: CartAction): LineaCarrito[] {
  switch (action.type) {
    case 'agregar': {
      const { producto, seleccion, observaciones, cantidad } = action;
      const igual = state.find((l) => mismaSeleccion(l, producto, seleccion, observaciones));
      if (igual) return state.map((l) => (l === igual ? { ...l, cantidad: l.cantidad + cantidad } : l));
      return [...state, { id: nuevoId(), producto, ...seleccion, observaciones, cantidad }];
    }
    case 'actualizar':
      return state.map((l) => (l.id === action.id ? { ...l, ...action.seleccion, observaciones: action.observaciones, cantidad: action.cantidad } : l));
    case 'cantidad':
      return action.cantidad <= 0 ? state.filter((l) => l.id !== action.id) : state.map((l) => (l.id === action.id ? { ...l, cantidad: action.cantidad } : l));
    case 'vaciar':
      return [];
  }
}

export const importeLinea = (l: LineaCarrito) => precioUnitario(l.producto, l) * l.cantidad;
export const detalleLinea = (l: LineaCarrito) => detalleSeleccion(l.producto, l);
export const totalCarrito = (lineas: LineaCarrito[]) => lineas.reduce((s, l) => s + importeLinea(l), 0);
export const platosCarrito = (lineas: LineaCarrito[]) => lineas.reduce((s, l) => s + l.cantidad, 0);
