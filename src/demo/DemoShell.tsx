import { useEffect, useState } from 'react';
import { HashRouter, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { App } from '../app/App';
import { rutas } from '../app/rutas';
import { DEMO_TOKEN, menuDemo } from '../services/mock/data';
import { Icon, type IconName } from '../shared/ui/Icon';
import { ToastProvider } from '../shared/ui/Toast';
import { cn } from '../shared/lib/cn';
import type { LineaCarrito } from '../features/pedido/cart/cartReducer';
import isotipo from '../assets/foodsync-isotipo.svg';

/* Solo para la vista previa (npm run build:demo). No forma parte de la app de producción. */
const T = DEMO_TOKEN;
const PASOS: Array<{ n: number; nombre: string; icon: IconName; ruta: string }> = [
  { n: 1, nombre: 'QR', icon: 'qr', ruta: rutas.escanear() },
  { n: 2, nombre: 'Bienvenida', icon: 'inicio', ruta: rutas.bienvenida(T) },
  { n: 3, nombre: 'Menú', icon: 'menu', ruta: rutas.menu(T) },
  { n: 4, nombre: 'Producto', icon: 'productos', ruta: rutas.producto(T, 'risotto') },
  { n: 5, nombre: 'Pedido', icon: 'carrito', ruta: rutas.pedido(T) },
  { n: 6, nombre: 'Confirmación', icon: 'check', ruta: rutas.confirmacion(T, 'ped_0418') },
  { n: 7, nombre: 'Estado', icon: 'reloj', ruta: rutas.estado(T, 'ped_0418') },
  { n: 8, nombre: 'Pago', icon: 'pagos', ruta: rutas.cuenta(T) },
];

const p = (id: string) => menuDemo.productos.find((x) => x.id === id)!;
const carritoDemo: LineaCarrito[] = [
  { id: 'demo1', producto: p('risotto'), varianteId: 'individual', extrasIds: ['parmesano'], observaciones: 'Sin cebolla en uno, por favor.', cantidad: 2 },
  { id: 'demo2', producto: p('pesca'), varianteId: 'coliflor', extrasIds: [], observaciones: '', cantidad: 1 },
];

/** QR de prueba de la mesa 7: escanéalo con la pantalla del paso 1 abierta en el teléfono. */
const URL_QR_DEMO = `https://app.foodsync.example${rutas.qr(T)}`;
function QrDePrueba() {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(URL_QR_DEMO, { margin: 1, width: 240, color: { dark: '#2A201B', light: '#FFFCF7' } }).then(setSrc);
  }, []);
  return (
    <div className="hidden items-center gap-3 rounded-xl border border-white/80 bg-surface/80 p-3 shadow-glass sm:flex">
      {src && <img src={src} alt="Código QR de prueba de la mesa 7" width={88} height={88} className="rounded-md" />}
      <p className="text-xs leading-[18px] text-ink-secondary"><b className="font-semibold text-ink">QR de prueba · Mesa 7.</b> Abre el paso 1 en tu teléfono y apunta la cámara a este código.</p>
    </div>
  );
}

function pasoActual(path: string) {
  // El más específico que coincida (p. ej. confirmación antes que estado).
  return [...PASOS].reverse().find((s) => path === s.ruta || (s.n === 1 && path.startsWith('/qr/')) || (s.n === 4 && path.includes('/menu/producto/')))?.n;
}

function Pasos() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const actual = pasoActual(pathname);
  return (
    <nav aria-label="Pasos del flujo" className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-white/80 bg-surface/80 p-1.5 shadow-glass backdrop-blur-md lg:flex-col lg:overflow-visible">
      {PASOS.map((s) => (
        <button
          key={s.n} type="button" onClick={() => navigate(s.ruta)} aria-current={actual === s.n ? 'step' : undefined}
          className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition', actual === s.n ? 'bg-primary-soft' : 'hover:bg-white/70')}
        >
          <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full', actual === s.n ? 'bg-primary text-on-primary' : 'bg-subtle text-ink-secondary')}>
            <Icon name={s.icon} size={16} />
          </span>
          <span className="flex flex-col pr-1">
            <span className="text-[10px] font-semibold uppercase leading-3 tracking-caption text-ink-muted">Paso {s.n}</span>
            <span className="display text-[17px] leading-5">{s.nombre}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

export function DemoShell() {
  try { sessionStorage.clear(); } catch { /* sin almacenamiento */ }
  if (!window.location.hash) window.location.hash = rutas.menu(T);
  return (
    <HashRouter>
      <div className="ambient min-h-[100dvh] sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
          <aside className="flex w-full max-w-[420px] flex-col gap-4 px-2 pt-2 sm:px-0 sm:pt-0 lg:sticky lg:top-8 lg:w-64">
            <div className="hidden items-center gap-2.5 sm:flex">
              <img src={isotipo} alt="" width={28} height={28} />
              <div className="flex flex-col">
                <span className="display text-xl leading-6">Food<em className="text-primary">Sync</em></span>
                <span className="text-[11px] font-semibold uppercase tracking-caption text-ink-muted">Web Cliente · vista previa</span>
              </div>
            </div>
            <Pasos />
            <QrDePrueba />
            <p className="hidden text-xs leading-[18px] text-ink-secondary sm:block">Datos de ejemplo. Toca, agrega platos y envía el pedido: todo funciona con un servidor simulado.</p>
          </aside>
          {/* Marco de teléfono en pantallas grandes; a pantalla completa en el móvil. */}
          <div className="w-full sm:w-[390px] sm:shrink-0 sm:rounded-[54px] sm:border-[10px] sm:border-[#2A201B] sm:bg-[#2A201B] sm:shadow-lg">
            <div className="relative overflow-hidden [--app-h:calc(100dvh-72px)] sm:h-[800px] sm:rounded-[44px] sm:[--app-h:800px]">
              <ToastProvider>
                <App carritoInicial={carritoDemo} />
              </ToastProvider>
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}
