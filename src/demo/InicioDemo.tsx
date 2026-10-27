import { Link } from 'react-router-dom';
import isotipo from '../assets/foodsync-isotipo.svg';
import { rutas, rutasCocina } from '../app/rutas';
import { DEMO_TOKEN } from '../services/mock/data';
import { Icon, type IconName } from '../shared/ui/Icon';

/* Solo para la vista previa: elige qué app abrir. El QR de la mesa 7 ya viene leído para probar sin cámara. */
const ACCESOS: Array<{ ruta: string; icono: IconName; titulo: string; detalle: string }> = [
  { ruta: rutas.qr(DEMO_TOKEN), icono: 'qr', titulo: 'App del cliente', detalle: 'El comensal pide desde su teléfono · Mesa 7 de Casa Olivo' },
  { ruta: rutasCocina.comandas(), icono: 'cocina', titulo: 'Cocina (KDS)', detalle: 'Pantalla del pase · tablet horizontal o computadora' },
];

export function InicioDemo() {
  return (
    <main className="ambient flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[720px] flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex items-center gap-2.5">
            <img src={isotipo} alt="" width={34} height={34} />
            <span className="display text-[34px] leading-none">Food<em className="text-primary">Sync</em></span>
          </span>
          <h1 className="display text-[44px] leading-[48px]">Elige qué app abrir</h1>
          <p className="max-w-[520px] text-[15px] leading-[22px] text-ink-secondary">
            Abre el cliente en una pestaña y la cocina en otra: lo que envía el comensal llega al KDS al instante y el cambio de estado vuelve a su teléfono.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ACCESOS.map((a) => (
            <div key={a.ruta} className="card relative flex flex-col gap-4 p-6 transition-shadow hover:shadow-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary"><Icon name={a.icono} size={24} /></span>
              <div className="flex flex-col gap-1">
                <Link to={a.ruta} className="display text-[30px] leading-8 after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:shadow-focus">
                  {a.titulo}
                </Link>
                <span className="text-sm text-ink-secondary">{a.detalle}</span>
              </div>
              <a href={`#${a.ruta}`} target="_blank" rel="noopener" className="relative z-10 inline-flex h-11 items-center gap-1.5 self-start text-sm font-semibold text-primary">
                Abrir en otra pestaña <Icon name="chevron-right" size={16} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
