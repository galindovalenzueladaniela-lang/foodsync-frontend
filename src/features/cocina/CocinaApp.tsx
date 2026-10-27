import { Route, Routes } from 'react-router-dom';
import { KdsLayout } from './components/KdsLayout';
import { SesionCocinaProvider } from './hooks/useSesion';
import { ComandaDetallePage } from './pages/ComandaDetallePage';
import { ComandasPage } from './pages/ComandasPage';
import { LoginPage } from './pages/LoginPage';
import { NotificacionesPage } from './pages/NotificacionesPage';
import { PedidosPage } from './pages/PedidosPage';
import { PerfilPage } from './pages/PerfilPage';

/* App de cocina (KDS · RF10) bajo /cocina. Todo menos el inicio de sesión pide sesión del personal. */
export default function CocinaApp() {
  return (
    <SesionCocinaProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<KdsLayout />}>
          <Route index element={<ComandasPage />} />
          <Route path="comanda/:id" element={<ComandaDetallePage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="*" element={<ComandasPage />} />
        </Route>
      </Routes>
    </SesionCocinaProvider>
  );
}
