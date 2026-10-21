import type { SVGProps } from 'react';

/* Iconos de contorno FoodSync (foodsync/icons, 24 × 24, trazo 1.6, currentColor). */
const PATHS = {
  agregar: 'M12 5.5v13M5.5 12h13',
  alerta: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0 M12 8v4.5M12 15.8v.2',
  buscar: 'M4.5 11a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0 M16 16l4 4',
  carrito: 'M5.5 8.5h13l-1 10.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3z M9 8.5V7a3 3 0 0 1 6 0v1.5',
  cerrar: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  'chevron-right': 'M9.5 6.5l5.5 5.5-5.5 5.5',
  cocina: 'M5 10.5h14 M6 10.5v6.5a2.5 2.5 0 0 0 2.5 2.5h7a2.5 2.5 0 0 0 2.5-2.5v-6.5 M9 7.5c0-1 .8-1.5.8-2.5M12.2 7.5c0-1 .8-1.5.8-2.5M15.4 7.5c0-1 .8-1.5.8-2.5',
  editar: 'M14.5 5.5l4 4 M4.5 19.5l1-4.2L15.8 5a2 2 0 0 1 2.83 0l.37.37a2 2 0 0 1 0 2.83L8.7 18.5z',
  eliminar: 'M4.5 7h15 M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7 M6.5 7l.8 11.6a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7 M10.5 11v5M13.5 11v5',
  info: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0 M12 11v5M12 8v.2',
  inicio: 'M6 3.5h3a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1 -2.5 2.5h-3a2.5 2.5 0 0 1 -2.5 -2.5v-4.5a2.5 2.5 0 0 1 2.5 -2.5z M16.5 3.5h1.5a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1 -2.5 2.5h-1.5a2.5 2.5 0 0 1 -2.5 -2.5v-1a2.5 2.5 0 0 1 2.5 -2.5z M16.5 12.5h1.5a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1 -2.5 2.5h-1.5a2.5 2.5 0 0 1 -2.5 -2.5v-3a2.5 2.5 0 0 1 2.5 -2.5z M6 15.5h3a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1 -2.5 2.5h-3a2.5 2.5 0 0 1 -2.5 -2.5v0a2.5 2.5 0 0 1 2.5 -2.5z',
  menos: 'M5.5 12h13',
  menu: 'M12 6.2c-1.6-1.3-4.3-1.9-7.5-1.7v14c3.2-.2 5.9.4 7.5 1.7c1.6-1.3 4.3-1.9 7.5-1.7v-14c-3.2-.2-5.9.4-7.5 1.7z M12 6.2v13.8 M15 9.5h1.8M15 12.8h1.8',
  mesas: 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M8 5.07A8 8 0 0 1 16 5.07 M18.93 8A8 8 0 0 1 18.93 16 M16 18.93A8 8 0 0 1 8 18.93 M5.07 16A8 8 0 0 1 5.07 8',
  notificaciones: 'M4 17.5h16 M5.5 17.5a6.5 6.5 0 0 1 13 0 M12 8.8V7M10.5 7h3 M9 20.5h6',
  pagos: 'M6 5.5h12a3 3 0 0 1 3 3v7a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-7a3 3 0 0 1 3 -3z M3 10h18 M7 14.5h3',
  pedidos: 'M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5V20l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 20z M9 8h6M9 11.5h6M9 15h3.5',
  productos: 'M4 12.3V5.5A1.5 1.5 0 0 1 5.5 4h6.8a1.5 1.5 0 0 1 1.06.44l6.7 6.7a1.5 1.5 0 0 1 0 2.12l-6.3 6.3a1.5 1.5 0 0 1-2.12 0l-6.7-6.7A1.5 1.5 0 0 1 4 12.3z M7.2 8.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0',
  qr: 'M5.5 4h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -1.5 1.5h-3a1.5 1.5 0 0 1 -1.5 -1.5v-3a1.5 1.5 0 0 1 1.5 -1.5z M15.5 4h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -1.5 1.5h-3a1.5 1.5 0 0 1 -1.5 -1.5v-3a1.5 1.5 0 0 1 1.5 -1.5z M5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1 -1.5 1.5h-3a1.5 1.5 0 0 1 -1.5 -1.5v-3a1.5 1.5 0 0 1 1.5 -1.5z M14 14h2.5v2.5M20 14v.2M14 20h.2M17.5 17.5H20V20h-2.5',
  reloj: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0 M12 7.5V12l3 2',
  ubicacion: 'M12 20.5s-6-5.4-6-10.3a6 6 0 0 1 12 0c0 4.9-6 10.3-6 10.3z M9.8 10.2a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, strokeWidth = 1.6, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" className="block shrink-0" {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
