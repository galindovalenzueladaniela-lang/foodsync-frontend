import { api, espera, usaMocks } from './http';
import { personalDemo } from './mock/cocinaSemilla';
import { PersonalSchema, type Personal } from './types';

/* RF2: el personal entra con Original Auth. Sin backend se elige una cuenta de prueba. */

const CLAVE = 'foodsync.cocina.sesion';
const AUTH_URL = import.meta.env.VITE_ORIGINAL_AUTH_URL as string | undefined;

export const cuentasDePrueba = personalDemo;

/** Página de Original Auth a la que se redirige (null mientras no esté configurada). */
export function urlOriginalAuth(): string | null {
  if (!AUTH_URL) return null;
  const vuelta = `${window.location.origin}/cocina/login`;
  return `${AUTH_URL}?client_id=foodsync-cocina&response_type=code&redirect_uri=${encodeURIComponent(vuelta)}`;
}

export function sesionGuardada(): Personal | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    const r = raw ? PersonalSchema.safeParse(JSON.parse(raw)) : null;
    return r?.success ? r.data : null;
  } catch {
    return null;
  }
}

function guardar(p: Personal | null) {
  try {
    if (p) localStorage.setItem(CLAVE, JSON.stringify(p));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: la sesión dura lo que la pestaña */
  }
}

/** Mock: entra con una de las cuentas de prueba. */
export async function iniciarSesionPrueba(id: string): Promise<Personal> {
  await espera(400);
  const p = personalDemo.find((x) => x.id === id);
  if (!p) throw new Error('Cuenta no encontrada');
  guardar(p);
  return p;
}

/** Con backend: canjea el código que devuelve Original Auth por los datos del personal. */
export async function completarSesion(code: string): Promise<Personal> {
  if (usaMocks) throw new Error('Sin backend no hay Original Auth');
  const p = await api('/cocina/sesion', PersonalSchema, { method: 'POST', body: JSON.stringify({ code }) });
  guardar(p);
  return p;
}

export async function cerrarSesion(): Promise<void> {
  guardar(null);
  if (!usaMocks) await fetch(`${import.meta.env.VITE_API_URL}/cocina/sesion`, { method: 'DELETE' }).catch(() => {});
}
