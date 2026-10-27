import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cambiarEstadoComanda, listarComandas, listarNotificaciones, revisarRetrasos } from '../../../services/cocinaService';
import { NOMBRE_AREA, NOMBRE_CANAL, siguienteEstado } from '../../../services/estadosPedido';
import { suscribirTiempoReal } from '../../../services/tiempoReal';
import type { Comanda, NotificacionCocina } from '../../../services/types';
import { useAhora } from './useAhora';

/* Datos en vivo del KDS compartidos por todas sus pantallas: comandas, notificaciones y el aviso de nuevo pedido. */

export type Carga<T> = { tipo: 'cargando' } | { tipo: 'error' } | { tipo: 'listo'; datos: T };

export interface AvisoNuevoPedido {
  clave: number;
  comandaId: string;
  titulo: string;
  detalle: string;
}

interface CocinaValue {
  comandas: Carga<Comanda[]>;
  notificaciones: Carga<NotificacionCocina[]>;
  ahora: number;
  recargar: () => void;
  /** Lleva la comanda al siguiente estado (botón grande). */
  avanzar: (c: Comanda) => Promise<void>;
  /** Pone en la lista la versión nueva de una comanda (tras cancelar un platillo, por ejemplo). */
  reemplazar: (c: Comanda) => void;
  aviso: AvisoNuevoPedido | null;
  cerrarAviso: () => void;
}

const Ctx = createContext<CocinaValue | null>(null);

export function CocinaProvider({ children }: { children: ReactNode }) {
  const [comandas, setComandas] = useState<Carga<Comanda[]>>({ tipo: 'cargando' });
  const [notificaciones, setNotificaciones] = useState<Carga<NotificacionCocina[]>>({ tipo: 'cargando' });
  const [aviso, setAviso] = useState<AvisoNuevoPedido | null>(null);
  const ahora = useAhora();

  // Mientras se recarga se conserva lo que ya se ve; el error solo se muestra si no había nada.
  const cargarComandas = useCallback(
    () => listarComandas()
      .then((datos) => { setComandas({ tipo: 'listo', datos }); return datos; })
      .catch(() => { setComandas((prev) => (prev.tipo === 'listo' ? prev : { tipo: 'error' })); return null; }),
    [],
  );
  const cargarNotificaciones = useCallback(
    () => listarNotificaciones()
      .then((datos) => setNotificaciones({ tipo: 'listo', datos }))
      .catch(() => setNotificaciones((prev) => (prev.tipo === 'listo' ? prev : { tipo: 'error' }))),
    [],
  );

  const recargar = useCallback(() => {
    setComandas((prev) => (prev.tipo === 'error' ? { tipo: 'cargando' } : prev));
    setNotificaciones((prev) => (prev.tipo === 'error' ? { tipo: 'cargando' } : prev));
    cargarComandas();
    cargarNotificaciones();
  }, [cargarComandas, cargarNotificaciones]);

  useEffect(() => {
    cargarComandas();
    cargarNotificaciones();
    const dejar = suscribirTiempoReal((e) => {
      if (e.tipo === 'notificaciones.actualizadas') {
        cargarNotificaciones();
        return;
      }
      cargarNotificaciones();
      cargarComandas().then((lista) => {
        if (e.tipo !== 'pedido.creado' || !lista) return;
        const suyas = lista.filter((c) => e.comandaIds.includes(c.id));
        if (!suyas.length) return;
        setAviso({
          clave: Date.now(), comandaId: suyas[0].id, titulo: `Nuevo pedido · ${suyas[0].mesa}`,
          detalle: `Llegó por ${NOMBRE_CANAL[suyas[0].canal]} · ${suyas.map((c) => NOMBRE_AREA[c.area]).join(', ')}`,
        });
        navigator.vibrate?.([80, 60, 80]);
      });
    });
    // RF10: avisos de retraso (en el mock se calculan aquí; con backend llegan por el canal).
    revisarRetrasos();
    const t = setInterval(revisarRetrasos, 30_000);
    return () => { dejar(); clearInterval(t); };
  }, [cargarComandas, cargarNotificaciones]);

  // El aviso flotante se va solo después de un rato; también se puede cerrar.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 12_000);
    return () => clearTimeout(t);
  }, [aviso]);

  const reemplazar = useCallback((c: Comanda) => {
    setComandas((prev) => (prev.tipo === 'listo' ? { tipo: 'listo', datos: prev.datos.map((x) => (x.id === c.id ? c : x)) } : prev));
  }, []);

  const avanzar = useCallback(async (c: Comanda) => {
    const siguiente = siguienteEstado(c.estado);
    if (!siguiente) return;
    reemplazar(await cambiarEstadoComanda(c.id, siguiente));
  }, [reemplazar]);

  const value = useMemo<CocinaValue>(
    () => ({ comandas, notificaciones, ahora, recargar, avanzar, reemplazar, aviso, cerrarAviso: () => setAviso(null) }),
    [comandas, notificaciones, ahora, recargar, avanzar, reemplazar, aviso],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCocina(): CocinaValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCocina debe usarse dentro de <CocinaProvider>');
  return v;
}
