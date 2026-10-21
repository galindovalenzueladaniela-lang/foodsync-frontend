import type { ZodType } from 'zod';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

/** Sin API configurada la app corre con los datos de ejemplo (desarrollo y vista previa). */
export const usaMocks = !API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Cliente REST hacia el API Gateway. Toda respuesta se valida con su esquema Zod. */
export async function api<T>(path: string, schema: ZodType<T, any, any>, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return schema.parse(await res.json());
}

/** Latencia simulada para que los estados de carga se vean en desarrollo. */
export const espera = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));
