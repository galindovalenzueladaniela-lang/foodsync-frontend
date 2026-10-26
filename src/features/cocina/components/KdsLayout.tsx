import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { Button } from '../../../shared/ui/Button';
import { esDeTablero } from '../lib/filtros';
import { CocinaProvider, useCocina } from '../hooks/useCocina';
import { useSesion } from '../hooks/useSesion';
import { AvisoNuevoPedido } from './AvisoNuevoPedido';
import { Dialogo } from './Dialogo';
import { Sidebar } from './Sidebar';

/** Marco del KDS: fondo espresso, sidebar, la pantalla activa y el aviso de nuevo pedido. Pide sesión (RF2). */
export function KdsLayout() {
  const { personal } = useSesion();
  const location = useLocation();
  if (!personal) return <Navigate to={rutasCocina.login()} replace state={{ desde: location.pathname }} />;
  return (
    <CocinaProvider>
      <Marco />
    </CocinaProvider>
  );
}

function Marco() {
  const { personal, salir } = useSesion();
  const { comandas, notificaciones, aviso, cerrarAviso } = useCocina();
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const navigate = useNavigate();
  const activas = comandas.tipo === 'listo' ? comandas.datos.filter((c) => esDeTablero(c.estado)).length : 0;
  const sinLeer = notificaciones.tipo === 'listo' ? notificaciones.datos.filter((n) => !n.leida).length : 0;

  return (
    <div className="kds-fondo flex h-[100dvh] overflow-hidden text-on-primary">
      <Sidebar personal={personal!} activas={activas} sinLeer={sinLeer} onSalir={() => setConfirmarSalida(true)} />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <Outlet />
        <AvisoNuevoPedido aviso={aviso} onCerrar={cerrarAviso} />
      </main>
      {confirmarSalida && (
        <Dialogo titulo="¿Salir de la cocina?" onCerrar={() => setConfirmarSalida(false)}>
          <p className="text-[15px] leading-[22px] text-ink-secondary">
            Las comandas siguen activas para el resto del turno. Para volver tendrás que iniciar sesión con Original Auth.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="!h-14 !text-base" onClick={() => setConfirmarSalida(false)}>Quedarme</Button>
            <Button className="!h-14 !text-base" onClick={async () => { await salir(); navigate(rutasCocina.login(), { replace: true }); }}>Salir</Button>
          </div>
        </Dialogo>
      )}
    </div>
  );
}
