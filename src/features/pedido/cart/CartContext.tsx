import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { cartReducer, platosCarrito, totalCarrito, type CartAction, type LineaCarrito } from './cartReducer';

interface CartValue {
  lineas: LineaCarrito[];
  dispatch: Dispatch<CartAction>;
  total: number;
  platos: number;
  /** Cantidad total de un producto en el carrito (para el contador de la tarjeta del menú). */
  cantidadDe: (productoId: string) => number;
}

const Ctx = createContext<CartValue | null>(null);

/* El carrito vive en el teléfono del comensal hasta que se envía (sessionStorage por mesa).
   La cuenta compartida de la mesa (RF6) se arma en el servidor con los pedidos ya enviados. */
const clave = (token: string) => `foodsync:carrito:${token}`;

function leer(token: string, inicial?: LineaCarrito[]): LineaCarrito[] {
  try {
    const raw = sessionStorage.getItem(clave(token));
    if (raw) return JSON.parse(raw) as LineaCarrito[];
  } catch { /* almacenamiento no disponible */ }
  return inicial ?? [];
}

export function CartProvider({ token, inicial, children }: { token: string; inicial?: LineaCarrito[]; children: ReactNode }) {
  const [lineas, dispatch] = useReducer(cartReducer, undefined, () => leer(token, inicial));

  useEffect(() => {
    try { sessionStorage.setItem(clave(token), JSON.stringify(lineas)); } catch { /* sin persistencia */ }
  }, [token, lineas]);

  const value = useMemo<CartValue>(() => ({
    lineas, dispatch,
    total: totalCarrito(lineas),
    platos: platosCarrito(lineas),
    cantidadDe: (id) => lineas.filter((l) => l.producto.id === id).reduce((s, l) => s + l.cantidad, 0),
  }), [lineas]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return v;
}
