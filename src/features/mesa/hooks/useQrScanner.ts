import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type EstadoCamara = 'iniciando' | 'escaneando' | 'sin_permiso' | 'sin_camara' | 'no_disponible';

/**
 * Abre la cámara trasera y busca un código QR en cada cuadro (jsQR, funciona en iOS y Android).
 * Requiere HTTPS o localhost; en otro caso el navegador no entrega la cámara.
 * `onDetect` devuelve true si el código sirve (se detiene) o false para seguir buscando.
 * `activo = false` apaga la cámara (p. ej. cuando ya se encontró la mesa).
 */
export function useQrScanner(onDetect: (texto: string) => boolean, activo: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoCamara>('iniciando');
  const [intento, setIntento] = useState(0);
  const detectar = useRef(onDetect);
  detectar.current = onDetect;

  useEffect(() => {
    if (!activo) return;
    let stream: MediaStream | null = null;
    let frame = 0;
    let vivo = true;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const escanear = () => {
      const video = videoRef.current;
      if (!vivo || !video || !ctx) return;
      if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth) {
        // Se analiza una copia reducida: suficiente para leer el QR y liviano para el teléfono.
        const escala = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * escala);
        canvas.height = Math.round(video.videoHeight * escala);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (qr?.data && detectar.current(qr.data)) return;
      }
      frame = requestAnimationFrame(escanear);
    };

    (async () => {
      setEstado('iniciando');
      if (!navigator.mediaDevices?.getUserMedia) return setEstado('no_disponible');
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (!vivo) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setEstado('escaneando');
        frame = requestAnimationFrame(escanear);
      } catch (e) {
        const nombre = (e as DOMException).name;
        setEstado(nombre === 'NotAllowedError' || nombre === 'SecurityError' ? 'sin_permiso' : nombre === 'NotFoundError' || nombre === 'OverconstrainedError' ? 'sin_camara' : 'no_disponible');
      }
    })();

    return () => {
      vivo = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [activo, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { videoRef, estado, reintentar };
}
