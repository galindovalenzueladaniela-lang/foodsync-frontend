import { useNavigate } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { Icon, type IconName } from '../../../shared/ui/Icon';
import { HospitalidadFoodSync } from '../../../shared/ui/Brand';
import { useMesa } from '../context/MesaContext';

const AUTH_URL = import.meta.env.VITE_ORIGINAL_AUTH_URL as string | undefined;

/* Paso 2 · Bienvenida: página pública del restaurante + acceso como invitado (RF2, RF3). */
export function WelcomePage() {
  const { ctx } = useMesa();
  const { restaurante: r, mesa, sucursal } = ctx;
  const navigate = useNavigate();
  const irAlMenu = () => navigate(rutas.menu(ctx.token));

  // Iniciar sesión es opcional (RF2). Original Auth devuelve al menú de la misma mesa.
  const iniciarSesion = () => {
    if (!AUTH_URL) return irAlMenu();
    const vuelta = new URL(rutas.menu(ctx.token), window.location.origin).href;
    window.location.href = `${AUTH_URL}?redirect_uri=${encodeURIComponent(vuelta)}`;
  };

  const datos: Array<[IconName, string]> = [
    ['ubicacion', r.direccion],
    ['reloj', r.horario],
    ['info', r.contacto],
  ];

  return (
    <Screen
      tone="surface"
      footer={
        <div className="flex flex-col gap-2.5 bg-surface">
          <Button block onClick={irAlMenu}>Continuar como invitado</Button>
          <Button block variant="secondary" onClick={iniciarSesion}>Iniciar sesión con Original Auth</Button>
          <p className="mt-2 text-center text-xs leading-[18px] text-ink-secondary">
            Iniciar sesión es opcional y guarda tu historial de pedidos.
            {r.paraLlevarUrl && (
              <a href={r.paraLlevarUrl} className="block font-semibold text-primary underline-offset-2 hover:underline">
                ¿Vienes por un pedido para llevar?
              </a>
            )}
          </p>
          <HospitalidadFoodSync />
        </div>
      }
    >
      <header
        className="relative flex h-[270px] shrink-0 flex-col justify-end px-6 pb-5 text-[#FFF8F0]"
        style={r.fotoUrl
          ? { backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(42,32,27,.65)), url(${r.fotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'radial-gradient(240px 180px at 70% 30%, rgba(198,134,63,.75), transparent 70%), radial-gradient(260px 200px at 15% 85%, rgba(110,46,63,.7), transparent 70%), radial-gradient(200px 160px at 90% 95%, rgba(93,140,102,.55), transparent 70%), repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 2px, transparent 2px 10px), #8C5A45' }}
      >
        {r.logoUrl && <img src={r.logoUrl} alt="" className="absolute left-6 top-6 h-10 w-10 rounded-full bg-surface object-contain p-1" />}
        <h1 className="display text-[44px] leading-[48px] tracking-[-0.01em]">{r.nombre}</h1>
        <p className="text-sm text-[#FBF3E8]">{r.descripcion} · Abierto hasta las {r.cierraA}</p>
      </header>

      <div className="flex flex-col gap-5 px-6 pt-5">
        <div className="flex items-center gap-3 rounded-lg bg-primary-soft px-4 py-3.5 text-primary">
          <Icon name="mesas" size={22} />
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold leading-5">Bienvenidos a la mesa {mesa.numero}</span>
            <span className="text-xs leading-4 text-primary/80">{mesa.area} · {sucursal.nombre}</span>
          </div>
        </div>
        <ul className="flex flex-col gap-3.5 px-1 text-sm text-ink-secondary">
          {datos.map(([icon, texto]) => (
            <li key={icon} className="flex items-center gap-3.5">
              <span className="text-ink-muted"><Icon name={icon} size={18} /></span>
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
