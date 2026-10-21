import { HashRouter } from 'react-router-dom';
import { App } from '../app/App';
import { rutas } from '../app/rutas';
import { menuDemo } from '../services/mock/data';
import { ToastProvider } from '../shared/ui/Toast';
import type { LineaCarrito } from '../features/pedido/cart/cartReducer';

/* Solo para la vista previa (npm run build:demo). No forma parte de la app de producción. */
const p = (id: string) => menuDemo.productos.find((x) => x.id === id)!;
const carritoDemo: LineaCarrito[] = [
  { id: 'demo1', producto: p('risotto'), varianteId: 'individual', extrasIds: ['parmesano'], observaciones: 'Sin cebolla en uno, por favor.', cantidad: 2 },
  { id: 'demo2', producto: p('pesca'), varianteId: 'coliflor', extrasIds: [], observaciones: '', cantidad: 1 },
];

export function DemoShell() {
  try { sessionStorage.clear(); } catch { /* sin almacenamiento */ }
  if (!window.location.hash) window.location.hash = rutas.escanear();
  return (
    <HashRouter>
      <div className="ambient min-h-[100dvh] sm:flex sm:items-center sm:justify-center sm:p-8">
        {/* Marco de teléfono en pantallas grandes; a pantalla completa en el móvil. */}
        <div className="w-full sm:w-[390px] sm:shrink-0 sm:rounded-[54px] sm:border-[10px] sm:border-[#2A201B] sm:bg-[#2A201B] sm:shadow-lg">
          <div className="relative overflow-hidden sm:h-[800px] sm:rounded-[44px] sm:[--app-h:800px]">
            <ToastProvider>
              <App carritoInicial={carritoDemo} />
            </ToastProvider>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}
