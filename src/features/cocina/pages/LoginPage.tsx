import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import isotipo from '../../../assets/foodsync-isotipo.svg';
import { rutasCocina } from '../../../app/rutas';
import { usaMocks } from '../../../services/http';
import { NOMBRE_AREA } from '../../../services/estadosPedido';
import { completarSesion, cuentasDePrueba, iniciarSesionPrueba, urlOriginalAuth } from '../../../services/sesionCocinaService';
import type { Personal } from '../../../services/types';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { useSesion } from '../hooks/useSesion';

/* Inicio de sesión del personal de cocina con Original Auth (RF2). Sin backend se elige una cuenta de prueba. */
export function LoginPage() {
  const { personal, entrar } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [eligiendo, setEligiendo] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const destino = (location.state as { desde?: string } | null)?.desde ?? rutasCocina.comandas();

  const listo = (p: Personal) => {
    entrar(p);
    navigate(destino, { replace: true });
  };

  // Vuelta de Original Auth con el código de autorización.
  const code = params.get('code');
  useEffect(() => {
    if (!code || usaMocks) return;
    setEnviando('auth');
    completarSesion(code).then(listo).catch(() => { setError('Original Auth no confirmó tu cuenta. Vuelve a intentarlo.'); setEnviando(null); });
  }, [code]);

  if (personal) return <Navigate to={destino} replace />;

  const iniciar = () => {
    setError(null);
    if (usaMocks) {
      setEligiendo(true);
      return;
    }
    const url = urlOriginalAuth();
    if (url) window.location.href = url;
    else setError('Original Auth no está configurado (VITE_ORIGINAL_AUTH_URL).');
  };

  const elegir = async (id: string) => {
    setEnviando(id);
    setError(null);
    try {
      listo(await iniciarSesionPrueba(id));
    } catch {
      setError('No pudimos iniciar sesión. Inténtalo de nuevo.');
      setEnviando(null);
    }
  };

  return (
    <main className="kds-fondo flex min-h-[100dvh] items-center justify-center overflow-y-auto px-6 py-10 text-on-primary">
      <div className="flex w-full max-w-[460px] flex-col gap-7">
        <div className="flex items-center justify-center gap-2.5">
          <img src={isotipo} alt="" width={34} height={34} />
          <span className="display text-[34px] leading-none tracking-[-0.015em] text-kds-text">FoodSync</span>
        </div>
        <section className="kds-tarjeta flex flex-col gap-5 p-7 text-ink">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Personal de cocina · KDS</span>
            <h1 className="display text-[40px] leading-[42px]">Comandas claras, <em className="text-accent">a fuego vivo.</em></h1>
            <p className="text-[15px] leading-[22px] text-ink-secondary">Entra con tu cuenta de Original Auth para ver las comandas de tu turno.</p>
          </div>
          {!eligiendo && (
            <Button block className="!h-14 !text-base" onClick={iniciar} disabled={enviando === 'auth'}>
              <Icon name="perfil" size={20} /> {enviando === 'auth' ? 'Conectando…' : 'Iniciar sesión con Original Auth'}
            </Button>
          )}
          {eligiendo && (
            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold">Elige una cuenta de prueba <span className="font-normal text-ink-muted">(sin backend)</span></span>
              {cuentasDePrueba.map((p) => (
                <button
                  key={p.id} type="button" onClick={() => elegir(p.id)} disabled={!!enviando}
                  className="flex min-h-14 items-center gap-3 rounded-md border border-line bg-elevated px-3.5 py-2 text-left shadow-xs transition-colors hover:bg-surface disabled:opacity-60 focus-visible:shadow-focus"
                >
                  <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                    {p.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[15px] font-semibold">{p.nombre}</span>
                    <span className="text-[13px] text-ink-secondary">{p.rol} · {p.area === 'todas' ? 'Todas las áreas' : NOMBRE_AREA[p.area]}</span>
                  </span>
                  {enviando === p.id ? <span className="text-sm text-ink-secondary">Entrando…</span> : <Icon name="chevron-right" size={20} className="text-ink-muted" />}
                </button>
              ))}
              <button type="button" onClick={() => setEligiendo(false)} className="h-11 text-sm font-semibold text-primary">Volver</button>
            </div>
          )}
          {error && <p role="alert" className="rounded-md bg-error-soft px-3.5 py-2.5 text-sm font-semibold text-error-text">{error}</p>}
        </section>
        <p className="text-center text-[13px] text-kds-text-muted">Tablet horizontal o computadora del pase.</p>
      </div>
    </main>
  );
}
