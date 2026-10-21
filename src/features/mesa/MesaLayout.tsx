import { Outlet, useParams } from 'react-router-dom';
import { Screen } from '../../shared/layout/Screen';
import { CartProvider } from '../pedido/cart/CartContext';
import type { LineaCarrito } from '../pedido/cart/cartReducer';
import { MesaProvider, useMesaToken } from './context/MesaContext';

/** Resuelve la mesa del token una sola vez y comparte mesa + carrito con todas las pantallas hijas. */
export function MesaLayout({ carritoInicial }: { carritoInicial?: LineaCarrito[] }) {
  const { token = '' } = useParams();
  const estado = useMesaToken(token);

  if (estado.tipo === 'cargando') return <Screen><p className="p-6 text-sm text-ink-secondary">Preparando tu mesa…</p></Screen>;
  if (estado.tipo === 'error') {
    return (
      <Screen className="justify-center gap-2 p-6 text-center">
        <h1 className="display text-3xl">No encontramos esta mesa</h1>
        <p className="text-sm text-ink-secondary">Vuelve a escanear el código QR de tu mesa o pide ayuda al personal.</p>
      </Screen>
    );
  }
  return (
    <MesaProvider ctx={estado.ctx}>
      <CartProvider token={token} inicial={carritoInicial}>
        <Outlet />
      </CartProvider>
    </MesaProvider>
  );
}
