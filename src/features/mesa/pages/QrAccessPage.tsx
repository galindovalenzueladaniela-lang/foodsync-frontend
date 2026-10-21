import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rutas } from '../../../app/rutas';
import { Screen } from '../../../shared/layout/Screen';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { QrGlyph } from '../components/QrGlyph';
import { lugarMesa, useMesaToken } from '../context/MesaContext';
import { useQrScanner, type EstadoCamara } from '../hooks/useQrScanner';
import { leerTokenQr } from '../lib/leerTokenQr';

const AVISOS: Partial<Record<EstadoCamara, string>> = {
  sin_permiso: 'Para escanear, permite el acceso a la cámara en tu navegador.',
  sin_camara: 'No encontramos una cámara en este dispositivo.',
  no_disponible: 'La cámara no está disponible aquí. Abre esta página con HTTPS o escanea el código con la cámara de tu teléfono.',
};

/* Paso 1 · Acceso por QR (RF5).
   - /escanear: escáner con la cámara del teléfono dentro de la app.
   - /qr/:token: el comensal escaneó con la cámara del sistema y el enlace ya trae la mesa. */
export function QrAccessPage() {
  const params = useParams();
  const [leido, setLeido] = useState<string | null>(params.token ?? null);
  const [rechazado, setRechazado] = useState(false);
  const escaneando = !leido;

  const onDetect = useCallback((texto: string) => {
    const token = leerTokenQr(texto);
    if (!token) {
      setRechazado(true);
      return false;
    }
    navigator.vibrate?.(40);
    setRechazado(false);
    setLeido(token);
    return true;
  }, []);
  const { videoRef, estado: camara, reintentar } = useQrScanner(onDetect, escaneando);

  // Un QR ajeno no detiene la cámara: se avisa un momento y se sigue buscando.
  useEffect(() => {
    if (!rechazado) return;
    const t = setTimeout(() => setRechazado(false), 1600);
    return () => clearTimeout(t);
  }, [rechazado]);
  const otraVez = () => { setRechazado(false); setLeido(null); };

  const enVivo = escaneando && camara === 'escaneando';

  return (
    <Screen tone="dark" className="relative items-center gap-6 px-5 pb-5 pt-8">
      {escaneando && (
        <video
          ref={videoRef} muted playsInline aria-hidden="true"
          className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', enVivo ? 'opacity-100' : 'opacity-0')}
        />
      )}
      {/* Oscurece la imagen fuera del recuadro para que el texto se lea */}
      {enVivo && <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(150px_150px_at_50%_42%,transparent_95%,rgba(20,13,10,0.55)_100%)]" />}

      <p className="relative text-center text-[15px] leading-[22px] text-[#EADFD2] [text-shadow:0_1px_8px_rgba(0,0,0,.5)]">
        Escanea el código de tu mesa<br />con la cámara del teléfono
      </p>

      <Visor enVivo={enVivo} leido={leido} rechazado={rechazado} />

      <div className="flex-1" />

      <section className="floating relative flex w-full flex-col gap-3.5 rounded-xl p-5 text-ink" aria-live="polite">
        {leido ? (
          <MesaEncontrada token={leido} onOtra={params.token ? undefined : otraVez} />
        ) : AVISOS[camara] ? (
          <>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-text">
              <Icon name="alerta" size={14} strokeWidth={2} /> Cámara no disponible
            </span>
            <p className="text-sm text-ink-secondary">{AVISOS[camara]}</p>
            <Button block variant="secondary" onClick={reintentar}>Intentar de nuevo</Button>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Icon name="qr" size={18} />
            {camara === 'iniciando' ? 'Abriendo la cámara…' : 'Apunta al código QR de la mesa'}
          </p>
        )}
      </section>
    </Screen>
  );
}

function Visor({ enVivo, leido, rechazado }: { enVivo: boolean; leido: string | null; rechazado: boolean }) {
  const esquinas = ['left-0 top-0 border-l-4 border-t-4 rounded-tl-xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-xl', 'left-0 bottom-0 border-b-4 border-l-4 rounded-bl-xl', 'right-0 bottom-0 border-b-4 border-r-4 rounded-br-xl'];
  return (
    <div className="relative flex h-[232px] w-[232px] items-center justify-center" aria-hidden="true">
      {esquinas.map((c) => (
        <span key={c} className={cn('absolute h-[38px] w-[38px] transition-colors', rechazado ? 'border-error' : leido ? 'border-success' : 'border-accent', c)} />
      ))}
      {enVivo && <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse rounded-full bg-accent/80 shadow-[0_0_12px_rgba(198,134,63,.9)]" />}
      {!enVivo && (
        <div className="flex rotate-[-4deg] flex-col items-center gap-2 rounded-[14px] bg-[#FFFCF7] p-3.5 pb-2.5 shadow-lg">
          <QrGlyph semilla={leido ?? 'foodsync'} size={128} />
          <span className="display text-lg leading-5 text-ink">{leido ? 'Listo' : ' '}</span>
        </div>
      )}
      {rechazado && <span className="absolute -bottom-9 rounded-full bg-error-soft px-3 py-1 text-xs font-semibold text-error-text">Este código no es de una mesa</span>}
    </div>
  );
}

function MesaEncontrada({ token, onOtra }: { token: string; onOtra?: () => void }) {
  const estado = useMesaToken(token);
  const navigate = useNavigate();
  if (estado.tipo === 'cargando') return <p className="text-sm text-ink-secondary">Buscando tu mesa…</p>;
  if (estado.tipo === 'error') {
    return (
      <>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-error-soft px-2.5 py-1 text-xs font-semibold text-error-text">
          <Icon name="alerta" size={14} strokeWidth={2} /> Código no reconocido
        </span>
        <p className="text-sm text-ink-secondary">Vuelve a escanear el código de tu mesa o pide ayuda al personal.</p>
        {onOtra && <Button block variant="secondary" onClick={onOtra}>Escanear de nuevo</Button>}
      </>
    );
  }
  return (
    <>
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-text">
        <Icon name="check" size={14} strokeWidth={2} /> Mesa encontrada
      </span>
      <div className="flex flex-col gap-0.5">
        <h1 className="display text-[30px] leading-8">{estado.ctx.restaurante.nombre}</h1>
        <p className="text-sm text-ink-secondary">{lugarMesa(estado.ctx, { conSucursal: true })}</p>
      </div>
      <Button block onClick={() => navigate(rutas.bienvenida(token))}>
        <Icon name="menu" size={18} /> Ver el menú
      </Button>
      {onOtra && <button type="button" onClick={onOtra} className="-mt-1 text-center text-xs font-semibold text-primary">No es mi mesa · escanear otra vez</button>}
    </>
  );
}
