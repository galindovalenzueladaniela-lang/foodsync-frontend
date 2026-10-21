import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/* Contenedor de cada pantalla: columna móvil (máx. 480 px), fondo "ambient" de la sala,
   y una zona inferior fija para la acción principal. La altura sale de --app-h (100dvh, o el marco de la vista previa). */
interface Props {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  tone?: 'ambient' | 'surface' | 'dark';
}

export function Screen({ children, footer, className, tone = 'ambient' }: Props) {
  return (
    <div
      className={cn(
        'relative mx-auto flex h-[var(--app-h)] w-full max-w-app flex-col overflow-y-auto overscroll-contain',
        tone === 'ambient' && 'ambient-soft',
        tone === 'surface' && 'bg-surface',
        tone === 'dark' && 'bg-[radial-gradient(420px_380px_at_50%_30%,#4A3A31,#1E1612_75%)] text-[#FBF3E8]',
      )}
    >
      <main className={cn('flex flex-1 flex-col', className)}>{children}</main>
      {footer && <div className="sticky bottom-0 z-20 mt-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
    </div>
  );
}
