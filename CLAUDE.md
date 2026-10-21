# FoodSync · Web Cliente

App web del comensal (pide desde la mesa con un QR) para la plataforma SaaS de restaurantes FoodSync.
Parte de frontend de Daniela Galindo; backend: Bibiana Soria; UX: Ingrid Rivera Carrillo.

## Reglas del proyecto
- Responde y escribe la interfaz en español.
- Stack fijo (tesis, Anexo D): TypeScript + React + Vite, Tailwind CSS, React Router, Zod, Vitest. No agregues otras librerías de UI ni de estado sin preguntar.
- Fuente de verdad visual: el lienzo FoodSync (cap. 12 Web Cliente). No rediseñes la identidad.
- Colores, tipografías, radios y sombras solo desde `src/styles/tokens.css` (vía clases de `tailwind.config.ts`). No inventes colores nuevos.
- Iconos: `src/shared/ui/Icon.tsx` (iconos FoodSync). Si falta uno, pide el SVG antes de usar otro set.
- Solo funciones justificadas en los requerimientos (Anexo E: RF1–RF12). Si algo no está, pregunta.
- Un botón principal (`<Button>` primary) por pantalla.
- Estructura feature-first: `features/<módulo>/{pages,components,hooks,lib}`, llamadas al backend solo en `src/services/` con su esquema Zod.

## Comandos
- `npm run dev` · app (sin `VITE_API_URL` usa datos de ejemplo de `src/services/mock`)
- `npm run dev:movil` · HTTPS en la red local para probar la cámara en el teléfono
- `npm run dev:demo` / `npm run build:demo` · vista previa con marco de teléfono
- `npm run typecheck` y `npm test` · deben pasar antes de dar algo por terminado

## Rutas
`/escanear` (cámara) · `/qr/:token` · `/m/:token` (bienvenida) · `/m/:token/menu` · `/m/:token/menu/producto/:id` ·
`/m/:token/pedido` · `/m/:token/pedido/:id/confirmacion` · `/m/:token/pedido/:id` (estado) · `/m/:token/cuenta`

## Pendientes conocidos
Ver la sección "Puntos abiertos" del README (estados del pedido, tiempo real, para llevar, endpoints con backend).
