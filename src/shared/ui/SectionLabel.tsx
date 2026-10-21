import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Etiqueta "caption" del sistema: 11/16, 600, tracking 0.16em, mayúsculas. */
export function SectionLabel({ as: Tag = 'span', className, children }: { as?: 'span' | 'h2' | 'h3' | 'legend'; className?: string; children: ReactNode }) {
  return <Tag className={cn('font-sans text-[11px] font-semibold uppercase leading-4 tracking-caption text-ink-muted', className)}>{children}</Tag>;
}
