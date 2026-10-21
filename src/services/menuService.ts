import { api, espera, usaMocks } from './http';
import { MenuSchema, type Menu } from './types';
import { menuDemo } from './mock/data';

/** Carta vigente de la sucursal de la mesa (S3 Catálogo). */
export async function obtenerMenu(token: string): Promise<Menu> {
  if (usaMocks) {
    await espera();
    return menuDemo;
  }
  return api(`/cliente/mesas/${encodeURIComponent(token)}/menu`, MenuSchema);
}
