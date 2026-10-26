import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { WelcomePage } from '../features/mesa/pages/WelcomePage';
import { MesaLayout } from '../features/mesa/MesaLayout';
import { MenuPage } from '../features/menu/pages/MenuPage';
import { ProductDetailPage } from '../features/menu/pages/ProductDetailPage';
import { CartPage } from '../features/pedido/pages/CartPage';
import { ConfirmationPage } from '../features/pedido/pages/ConfirmationPage';
import { OrderStatusPage } from '../features/pedido/pages/OrderStatusPage';
import { PaymentPage } from '../features/pagos/pages/PaymentPage';
import type { LineaCarrito } from '../features/pedido/cart/cartReducer';
import { Screen } from '../shared/layout/Screen';

// El escáner (jsQR) se carga aparte para que el menú abra rápido en el teléfono (RNF 2).
const QrAccessPage = lazy(() => import('../features/mesa/pages/QrAccessPage').then((m) => ({ default: m.QrAccessPage })));
// La cocina (KDS) es otra app con otro dispositivo: se carga aparte.
const CocinaApp = lazy(() => import('../features/cocina/CocinaApp'));

const escaner = (
  <Suspense fallback={<Screen tone="dark"><span className="sr-only">Abriendo la cámara…</span></Screen>}>
    <QrAccessPage />
  </Suspense>
);

export function App({ carritoInicial }: { carritoInicial?: LineaCarrito[] }) {
  return (
    <Routes>
      <Route path="/cocina/*" element={<Suspense fallback={<div className="kds-fondo h-[100dvh]" />}><CocinaApp /></Suspense>} />
      <Route path="/escanear" element={escaner} />
      <Route path="/qr/:token" element={escaner} />
      <Route path="/m/:token" element={<MesaLayout carritoInicial={carritoInicial} />}>
        <Route index element={<WelcomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/producto/:productoId" element={<ProductDetailPage />} />
        <Route path="pedido" element={<CartPage />} />
        <Route path="pedido/:pedidoId" element={<OrderStatusPage />} />
        <Route path="pedido/:pedidoId/confirmacion" element={<ConfirmationPage />} />
        <Route path="cuenta" element={<PaymentPage />} />
      </Route>
      <Route
        path="*"
        element={
          <Screen className="justify-center gap-2 p-6 text-center">
            <h1 className="display text-3xl">Escanea el QR de tu mesa</h1>
            <p className="text-sm text-ink-secondary">El código está en tu mesa y abre la carta del restaurante.</p>
            <Link to="/escanear" className="mx-auto mt-2 text-sm font-semibold text-primary">Abrir la cámara</Link>
          </Screen>
        }
      />
    </Routes>
  );
}
