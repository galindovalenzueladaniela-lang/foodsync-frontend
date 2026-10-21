import { api, espera, usaMocks, ApiError } from './http';
import { MesaContextoSchema, type MesaContexto } from './types';
import { mesaDemo } from './mock/data';

/** RF5: el QR de cada mesa lleva un token con restaurante, sucursal y número de mesa. */
export async function resolverMesa(token: string): Promise<MesaContexto> {
  if (usaMocks) {
    await espera();
    if (token !== mesaDemo.token) throw new ApiError(404, 'Mesa no encontrada');
    return mesaDemo;
  }
  return api(`/cliente/mesas/${encodeURIComponent(token)}`, MesaContextoSchema);
}

/** RF7: alerta silenciosa al personal. */
export async function llamarMesero(token: string): Promise<void> {
  if (usaMocks) return espera();
  await fetch(`${import.meta.env.VITE_API_URL}/cliente/mesas/${encodeURIComponent(token)}/llamar-mesero`, { method: 'POST' });
}
