import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/* Button del sistema FoodSync: variant (primary, secondary, ghost) · size (md 40, lg 48).
   "Un botón principal por pantalla": primary se usa una sola vez por vista. */
type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 min-w-0 whitespace-nowrap rounded-md font-semibold tracking-[0.005em] ' +
  'transition-[background,box-shadow,transform,border-color,color] duration-200 ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-[0.45] focus-visible:shadow-focus';

const variants: Record<Variant, string> = {
  primary:
    'border border-primary-pressed text-on-primary shadow-button bg-[linear-gradient(180deg,var(--color-primary-light)_0%,var(--color-primary)_100%)] ' +
    'hover:bg-[linear-gradient(180deg,var(--color-primary)_0%,var(--color-primary-hover)_100%)] active:bg-primary-pressed',
  secondary: 'border border-line bg-elevated text-ink shadow-xs hover:bg-surface active:bg-subtle',
  ghost: 'border border-transparent bg-transparent text-primary hover:bg-primary/[0.08] active:bg-primary/[0.16]',
};

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px] leading-5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', block, className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest} />;
});
