import { espera, usaMocks } from './http';
import type { MetodoPago } from './types';

export interface SolicitudPago {
  mesaToken: string;
  pedidoIds: string[];
  propina: number;
  metodo: MetodoPago;
}

export type ResultadoPago =
  | { tipo: 'redireccion'; url: string } // Original Pay: checkout externo
  | { tipo: 'aviso_personal' };          // Efectivo, terminal o transferencia: el personal lo registra (RF11)

/** RF7 "solicitar la cuenta" + RF11 pagos (S6 Pagos, integración con Original Pay). */
export async function pagarCuenta(req: SolicitudPago): Promise<ResultadoPago> {
  if (usaMocks) {
    await espera(500);
    return req.metodo === 'original_pay' ? { tipo: 'redireccion', url: '#pago-confirmado' } : { tipo: 'aviso_personal' };
  }
  const res = await fetch(`${import.meta.env.VITE_API_URL}/cliente/mesas/${encodeURIComponent(req.mesaToken)}/pagos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('No se pudo iniciar el pago');
  return res.json();
}

/** RF7: el comensal pide la cuenta; la mesa pasa a "esperando cuenta" en el mapa del mesero. */
export async function solicitarCuenta(mesaToken: string): Promise<void> {
  if (usaMocks) return espera(100);
  await fetch(`${import.meta.env.VITE_API_URL}/cliente/mesas/${encodeURIComponent(mesaToken)}/solicitar-cuenta`, { method: 'POST' });
}
