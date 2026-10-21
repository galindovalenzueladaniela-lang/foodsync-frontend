/**
 * Extrae el token de mesa del texto de un QR.
 * El QR de cada mesa (RF5) lleva la URL de la app: https://<dominio>/qr/<token> (o /m/<token>).
 * También acepta la URL con hash (#/qr/<token>) y el token solo.
 */
const TOKEN = /^[A-Za-z0-9_-]{4,64}$/;

export function leerTokenQr(texto: string): string | null {
  const t = texto.trim();
  const enRuta = t.match(/\/(?:qr|m)\/([A-Za-z0-9_-]{4,64})(?:[/?#]|$)/);
  if (enRuta) return enRuta[1];
  return TOKEN.test(t) ? t : null;
}
