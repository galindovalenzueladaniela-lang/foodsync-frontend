/* Comprobante de pago (RF11): los mismos datos se muestran en pantalla y se guardan como imagen.
   Mientras Original Pay no entregue su comprobante oficial, se arma con la cuenta pagada. */
export interface Comprobante {
  restaurante: string;
  lugar: string;
  fecha: string;
  pedidos: string;
  filas: Array<[string, string]>;
  total: string;
  metodo: string;
  emitido: Date;
}

export function nombreArchivo(c: Comprobante): string {
  const d = c.emitido;
  const dos = (n: number) => String(n).padStart(2, '0');
  const slug = c.restaurante.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `comprobante-${slug}-${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}-${dos(d.getHours())}${dos(d.getMinutes())}.png`;
}

const ANCHO = 360;
const ESCALA = 3;
const PAD = 28;

/** Dibuja el comprobante como ticket (PNG) con los colores y tipografías de tokens.css. */
export async function comprobanteComoImagen(c: Comprobante): Promise<File> {
  const token = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(`--color-${n}`).trim();
  const color = {
    fondo: token('surface'), texto: token('text'), secundario: token('text-secondary'), tenue: token('text-muted'),
    linea: token('border'), exito: token('success-text'), exitoSuave: token('success-soft'),
  };
  const serif = '"Instrument Serif", Georgia, serif';
  const sans = '"Instrument Sans", system-ui, sans-serif';
  await Promise.all([document.fonts.load(`400 30px ${serif}`), document.fonts.load(`600 14px ${sans}`), document.fonts.load(`400 14px ${sans}`)]).catch(() => {});

  const alto = 380 + c.filas.length * 26;
  const canvas = document.createElement('canvas');
  canvas.width = ANCHO * ESCALA;
  canvas.height = alto * ESCALA;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(ESCALA, ESCALA);

  // Ticket con borde inferior dentado
  ctx.fillStyle = color.fondo;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ANCHO, 0);
  ctx.lineTo(ANCHO, alto);
  for (let x = ANCHO; x > 0; x -= 16) ctx.arc(x - 8, alto, 6, 0, Math.PI, true);
  ctx.lineTo(0, alto);
  ctx.closePath();
  ctx.fill();

  let y = PAD + 8;
  const texto = (t: string, x: number, font: string, fill: string, align: CanvasTextAlign = 'left') => {
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  };
  const separador = () => {
    ctx.strokeStyle = color.linea;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(ANCHO - PAD, y);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  const fila = (izq: string, der: string, fill = color.texto) => {
    texto(izq, PAD, `400 14px ${sans}`, fill);
    texto(der, ANCHO - PAD, `400 14px ${sans}`, fill, 'right');
  };

  texto('COMPROBANTE DE PAGO', PAD, `600 11px ${sans}`, color.tenue);
  y += 36;
  texto(c.restaurante, PAD, `400 32px ${serif}`, color.texto);
  y += 24;
  texto(c.lugar, PAD, `400 13px ${sans}`, color.secundario);
  y += 20;
  texto(c.fecha, PAD, `400 13px ${sans}`, color.secundario);
  y += 22;
  separador();
  y += 28;
  fila('Pedidos', c.pedidos, color.secundario);
  y += 26;
  for (const [izq, der] of c.filas) {
    fila(izq, der);
    y += 26;
  }
  y -= 4;
  separador();
  y += 40;
  texto('Total', PAD, `600 15px ${sans}`, color.texto);
  texto(c.total, ANCHO - PAD, `400 34px ${serif}`, color.texto, 'right');
  y += 30;
  fila('Método', c.metodo, color.secundario);
  y += 34;

  // Sello "Pagado"
  ctx.fillStyle = color.exitoSuave;
  ctx.beginPath();
  ctx.roundRect(PAD, y - 17, 92, 26, 13);
  ctx.fill();
  texto('✓  Pagado', PAD + 14, `600 12px ${sans}`, color.exito);
  y += 46;
  texto('Gracias por tu visita · FoodSync', ANCHO / 2, `400 11px ${sans}`, color.tenue, 'center');

  const blob = await new Promise<Blob>((ok, falla) => canvas.toBlob((b) => (b ? ok(b) : falla(new Error('No se pudo generar el comprobante'))), 'image/png'));
  return new File([blob], nombreArchivo(c), { type: 'image/png' });
}
