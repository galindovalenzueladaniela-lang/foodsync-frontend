import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { iconPath } from './Icon';

/* Palomita de éxito animada (QR leído, pedido recibido): el círculo aparece con un rebote,
   la palomita se dibuja y salen una onda y destellos con los colores de la marca.
   El estado final es el mismo dibujo quieto; con "reducir movimiento" se muestra así desde el inicio.
   Las animaciones están en styles/index.css (.check-anim). */
interface Props {
  size?: number;
  /** soft: círculo verde claro con halos (confirmación del pedido). solid: círculo verde lleno (mesa encontrada). */
  tone?: 'soft' | 'solid';
  className?: string;
}

// Destellos alrededor del círculo: rayos y puntos alternados en vino, ocre y verde.
const DESTELLOS = Array.from({ length: 12 }, (_, i) => ({
  angulo: i * 30 + (i % 2 ? 8 : 0),
  rayo: i % 2 === 0,
  color: ['bg-accent', 'bg-primary', 'bg-success'][i % 3],
  distancia: i % 2 ? 0.34 : 0.46,
}));

export function AnimatedCheck({ size = 96, tone = 'soft', className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn('check-anim relative inline-flex shrink-0 items-center justify-center', tone === 'solid' && 'check-anim--solid', className)}
      style={{ width: size, height: size }}
    >
      <span className="check-anim__onda absolute inset-0 rounded-full" />
      {DESTELLOS.map((d) => (
        <span
          key={d.angulo}
          className={cn('check-anim__destello absolute left-1/2 top-1/2 rounded-full', d.color, d.rayo ? 'h-2.5 w-[3px]' : 'h-1.5 w-1.5')}
          style={{ '--a': `${d.angulo}deg`, '--r': `${size / 2 + 4}px`, '--d': `${Math.round(size * d.distancia)}px` } as CSSProperties}
        />
      ))}
      <span className={cn('check-anim__disco absolute inset-0 rounded-full', tone === 'solid' ? 'bg-success' : 'bg-success-soft')} />
      <svg
        viewBox="0 0 24 24" width={Math.round(size * 0.52)} height={Math.round(size * 0.52)} fill="none"
        stroke="currentColor" strokeWidth={tone === 'solid' ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
        className={cn('relative', tone === 'solid' ? 'text-on-primary' : 'text-success-text')}
      >
        <path d={iconPath('check')} pathLength={1} className="check-anim__trazo" />
      </svg>
    </span>
  );
}
