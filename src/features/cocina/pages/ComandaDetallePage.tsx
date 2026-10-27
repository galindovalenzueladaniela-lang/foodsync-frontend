import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rutasCocina } from '../../../app/rutas';
import { cancelarPlatillo, obtenerComanda } from '../../../services/cocinaService';
import { NOMBRE_AREA, NOMBRE_CANAL } from '../../../services/estadosPedido';
import type { Comanda } from '../../../services/types';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { cn } from '../../../shared/lib/cn';
import { BotonEstado } from '../components/BotonEstado';
import { Dialogo } from '../components/Dialogo';
import { Encabezado, Reloj } from '../components/Encabezado';
import { Cargando, ErrorCarga } from '../components/Estados';
import { EtiquetaEstado, NotaCocina, TiempoChip } from '../components/Etiquetas';
import { useCocina } from '../hooks/useCocina';
import { ESTILO_ESTADO } from '../lib/estilos';
import { horaLocal, minutosDesde, textoMinutos } from '../lib/tiempo';

type Linea = Comanda['lineas'][number];

/* Detalle de comanda: platos con variantes y extras, observaciones, horas y cancelación de platillos (RF10). */
export function ComandaDetallePage() {
  const { id = '' } = useParams();
  const { comandas, ahora, avanzar, reemplazar } = useCocina();
  const navigate = useNavigate();
  const deLista = comandas.tipo === 'listo' ? comandas.datos.find((c) => c.id === id) : undefined;
  const [propia, setPropia] = useState<Comanda | null>(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [cancelando, setCancelando] = useState<Linea | null>(null);
  const [avisoEnviado, setAvisoEnviado] = useState<string | null>(null);

  // Si la comanda no está en la lista (p. ej. al abrir el enlace directo), se pide aparte.
  useEffect(() => {
    if (deLista || comandas.tipo === 'cargando') return;
    let vivo = true;
    setError(false);
    obtenerComanda(id).then((c) => vivo && setPropia(c)).catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, [id, deLista, comandas.tipo, intento]);

  const c = deLista ?? propia;
  // Vuelve a la pantalla anterior (con sus filtros); si se abrió directo, al tablero.
  const volver = () => ((window.history.state as { idx?: number } | null)?.idx ? navigate(-1) : navigate(rutasCocina.comandas()));

  if (!c) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
        <Encabezado titulo="Comanda"><Volver onClick={volver} /></Encabezado>
        {error || comandas.tipo === 'error'
          ? <ErrorCarga titulo="No encontramos esta comanda" detalle="Puede que el enlace sea de otro turno o que se haya perdido la conexión." onReintentar={() => setIntento((n) => n + 1)} />
          : <Cargando texto="Cargando la comanda…" />}
      </div>
    );
  }

  const e = ESTILO_ESTADO[c.estado];
  const minutos = minutosDesde(c.creadoEn, ahora);
  const activa = c.estado !== 'entregado' && c.estado !== 'cancelado';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
      <Encabezado titulo={c.mesa}>
        <Volver onClick={volver} />
        <div className="flex-1" />
        <Reloj />
      </Encabezado>

      {avisoEnviado && (
        <p role="status" className="floating aviso-entra flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] text-ink">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text"><Icon name="check" size={16} strokeWidth={2} /></span>
          <span><b className="font-semibold">{avisoEnviado} cancelado.</b> Avisamos al mesero y al administrador.</span>
        </p>
      )}

      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <article className={cn('kds-tarjeta flex flex-col overflow-hidden border-t-[6px] text-ink', e.franja)}>
          <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div className="flex flex-col gap-1">
              <span className="display text-[40px] leading-10">{c.mesa}</span>
              <span className="text-[15px] text-ink-secondary">#{c.numero} · {NOMBRE_CANAL[c.canal]} · {NOMBRE_AREA[c.area]}</span>
            </div>
            <div className="flex items-center gap-2"><EtiquetaEstado estado={c.estado} /><TiempoChip minutos={minutos} /></div>
          </header>
          <ul className="flex flex-col">
            {c.lineas.map((l) => (
              <li key={l.indice} className="flex flex-wrap items-center gap-4 border-t border-dashed border-line-dashed px-6 py-4">
                <span className={cn('min-w-[34px] text-[22px] font-semibold tabular-nums', l.cancelada ? 'text-ink-muted' : e.cantidad)}>{l.cantidad}×</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={cn('text-[19px] font-semibold leading-6', l.cancelada && 'text-ink-muted line-through')}>{l.nombre}</span>
                  {l.detalle && <span className="text-[15px] text-ink-secondary">{l.detalle}</span>}
                  {l.observaciones && !l.cancelada && <span className="text-[15px] font-semibold text-kds-nota">«{l.observaciones}»</span>}
                  {l.cancelada && (
                    <span className="text-sm font-semibold text-error-text">Cancelado a las {horaLocal(l.cancelada.en)} · {l.cancelada.motivo}</span>
                  )}
                </div>
                {!l.cancelada && activa && (
                  <button
                    type="button" onClick={() => setCancelando(l)}
                    className="kds-btn-peligro inline-flex h-14 items-center gap-2 rounded-md px-4 text-[15px] font-bold focus-visible:shadow-focus"
                  >
                    <Icon name="cerrar" size={18} strokeWidth={2} /> Cancelar platillo
                  </button>
                )}
              </li>
            ))}
          </ul>
          <NotaCocina notas={c.nota ? [c.nota] : []} className="mx-6 mb-5" />
        </article>

        <aside className="flex flex-col gap-[18px]">
          <section className="kds-tarjeta flex flex-col gap-4 p-5 text-ink">
            <h2 className="font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Tiempos</h2>
            <dl className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5"><dt className="text-sm text-ink-secondary">Hora del pedido</dt><dd className="display text-[32px] leading-9 tabular-nums">{horaLocal(c.creadoEn)}</dd></div>
              <div className="flex flex-col gap-0.5"><dt className="text-sm text-ink-secondary">Tiempo transcurrido</dt><dd className="display text-[32px] leading-9 tabular-nums">{textoMinutos(minutos)}</dd></div>
            </dl>
            <ol className="flex flex-col gap-2 border-t border-dashed border-line-dashed pt-3">
              {c.historial.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-[15px]">
                  <span className="flex items-center gap-2"><span aria-hidden="true" className={cn('h-2 w-2 rounded-full', ESTILO_ESTADO[h.estado].punto)} />{ESTILO_ESTADO[h.estado].etiqueta}</span>
                  <span className="tabular-nums text-ink-secondary">{horaLocal(h.en)}</span>
                </li>
              ))}
            </ol>
          </section>
          {/* Al avanzar, el botón siguiente entra con un movimiento corto. */}
          <BotonEstado key={c.estado} comanda={c} onAvanzar={avanzar} className="kds-entra" />
        </aside>
      </div>

      {cancelando && (
        <CancelarPlatillo
          comanda={c} linea={cancelando} onCerrar={() => setCancelando(null)}
          onCancelado={(nueva) => {
            reemplazar(nueva);
            setPropia(nueva);
            setAvisoEnviado(`${cancelando.cantidad}× ${cancelando.nombre}`);
            setCancelando(null);
          }}
        />
      )}
    </div>
  );
}

function Volver({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="kds-chip-borde inline-flex h-11 items-center gap-1.5 rounded-full pl-3 pr-4 text-[15px] font-semibold text-kds-text-secondary hover:bg-[rgba(255,248,240,0.14)] focus-visible:shadow-focus">
      <Icon name="chevron-right" size={18} className="block rotate-180" /> Volver
    </button>
  );
}

/** RF10: cancelar un platillo por falta de ingredientes, con su motivo; el backend avisa al mesero y al administrador. */
function CancelarPlatillo({ comanda, linea, onCerrar, onCancelado }: { comanda: Comanda; linea: Linea; onCerrar: () => void; onCancelado: (c: Comanda) => void }) {
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const valido = motivo.trim().length >= 3;
  const confirmar = async () => {
    setEnviando(true);
    setError(false);
    try {
      onCancelado(await cancelarPlatillo(comanda.id, linea.indice, `Falta de ingredientes: ${motivo.trim()}`));
    } catch {
      setError(true);
      setEnviando(false);
    }
  };
  return (
    <Dialogo titulo="Cancelar platillo" onCerrar={onCerrar}>
      <p className="text-[15px] leading-[22px] text-ink-secondary">
        <b className="font-semibold text-ink">{linea.cantidad}× {linea.nombre}</b> · {comanda.mesa} · #{comanda.numero}.
        Avisaremos al mesero y al administrador para que hablen con el comensal.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">¿Qué ingrediente falta?</span>
        <textarea
          value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} maxLength={140}
          placeholder="Ej. Se terminaron los hongos del bosque"
          className="resize-none rounded-md border border-line bg-elevated px-3.5 py-3 text-base outline-none focus-visible:shadow-focus"
        />
      </label>
      {error && <p role="alert" className="text-sm font-semibold text-error-text">No se pudo cancelar. Inténtalo de nuevo.</p>}
      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button variant="secondary" className="!h-14 !text-base" onClick={onCerrar}>Volver</Button>
        <button
          type="button" onClick={confirmar} disabled={!valido || enviando}
          className="kds-btn-peligro inline-flex h-14 items-center justify-center rounded-md text-base font-bold disabled:opacity-45 focus-visible:shadow-focus"
        >
          {enviando ? 'Cancelando…' : 'Cancelar y avisar'}
        </button>
      </div>
    </Dialogo>
  );
}
