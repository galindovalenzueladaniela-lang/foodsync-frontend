import type { ReactNode } from 'react';
import type { Tono } from '../../services/types';
import { cn } from '../lib/cn';

/* Mientras el restaurante no sube la foto (MediaAAS), se muestra una "luz de plato" con el tono del producto,
   igual que en el diseño. Con fotoUrl se usa la fotografía real. */
const TONOS: Record<Tono, string> = {
  paprika: 'radial-gradient(60% 55% at 62% 42%, rgba(208,105,58,.75), transparent 70%), radial-gradient(70% 60% at 22% 88%, rgba(93,140,102,.45), transparent 70%), #F4DDC8',
  salvia: 'radial-gradient(60% 55% at 62% 42%, rgba(93,140,102,.6), transparent 70%), radial-gradient(70% 60% at 22% 88%, rgba(201,144,46,.45), transparent 70%), #E6EBDD',
  miel: 'radial-gradient(60% 55% at 62% 42%, rgba(201,144,46,.6), transparent 70%), radial-gradient(70% 60% at 22% 88%, rgba(200,105,58,.35), transparent 70%), #F6EAD6',
  tinto: 'radial-gradient(60% 55% at 62% 42%, rgba(110,46,63,.7), transparent 70%), radial-gradient(70% 60% at 22% 88%, rgba(198,134,63,.4), transparent 70%), #EEDCDD',
  pizarra: 'radial-gradient(60% 55% at 62% 42%, rgba(90,122,150,.55), transparent 70%), radial-gradient(70% 60% at 22% 88%, rgba(93,140,102,.4), transparent 70%), #E3E8E6',
};
const TEXTURA = 'repeating-linear-gradient(45deg, rgba(110,46,63,.04) 0 2px, transparent 2px 9px)';

interface Props {
  tono: Tono;
  fotoUrl?: string;
  alt: string;
  agotado?: boolean;
  className?: string;
  children?: ReactNode;
}

export function FoodImage({ tono, fotoUrl, alt, agotado, className, children }: Props) {
  return (
    <div
      className={cn('relative overflow-hidden', agotado && 'grayscale-[0.7]', className)}
      style={fotoUrl ? undefined : { background: `${TEXTURA}, ${TONOS[tono]}` }}
    >
      {fotoUrl ? (
        <img src={fotoUrl} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle at 40% 35%, rgba(255,252,247,.55), rgba(255,252,247,.08) 60%, transparent 72%)' }}
        />
      )}
      {children}
    </div>
  );
}
