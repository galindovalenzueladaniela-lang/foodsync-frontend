import { describe, expect, it } from 'vitest';
import { leerTokenQr } from './leerTokenQr';

describe('leerTokenQr', () => {
  it('lee el token de la URL del QR', () => {
    expect(leerTokenQr('https://app.foodsync.example/qr/casa-olivo-centro-m7')).toBe('casa-olivo-centro-m7');
    expect(leerTokenQr('https://x.example/m/abc123/menu')).toBe('abc123');
    expect(leerTokenQr('https://x.example/#/qr/abc123?ref=mesa')).toBe('abc123');
  });
  it('acepta el token solo y rechaza otros textos', () => {
    expect(leerTokenQr(' casa-olivo-centro-m7 ')).toBe('casa-olivo-centro-m7');
    expect(leerTokenQr('https://otro-sitio.example/promo')).toBeNull();
    expect(leerTokenQr('hola mundo')).toBeNull();
  });
});
