# FoodSync · Web Cliente y Cocina (KDS)

App web del comensal (pide desde la mesa con un QR) y pantalla de cocina (KDS) para la plataforma SaaS de restaurantes FoodSync.
Parte de frontend de Daniela Galindo; backend: Bibiana Soria; UX: Ingrid Rivera Carrillo.

## Reglas del proyecto
- Responde y escribe la interfaz en español.
- Stack fijo (tesis, Anexo D): TypeScript + React + Vite, Tailwind CSS, React Router, Zod, Vitest. No agregues otras librerías de UI ni de estado sin preguntar.
- Fuente de verdad visual: el lienzo FoodSync (cap. 12 Web Cliente; lienzo 14 Cocina · KDS). No rediseñes la identidad.
- El cliente es para teléfono; la cocina para tablet horizontal o escritorio (≥ 1024 px; 768 px vertical se reacomoda). Botones de acción de cocina de 56 px.
- Colores, tipografías, radios y sombras solo desde `src/styles/tokens.css` (vía clases de `tailwind.config.ts`). No inventes colores nuevos.
- Iconos: `src/shared/ui/Icon.tsx` (iconos FoodSync). Si falta uno, pide el SVG antes de usar otro set.
- Solo funciones justificadas en los requerimientos (Anexo E: RF1–RF12). Si algo no está, pregunta.
- Un botón principal (`<Button>` primary) por pantalla.
- Estructura feature-first: `features/<módulo>/{pages,components,hooks,lib}`, llamadas al backend solo en `src/services/` con su esquema Zod.

## Comandos
- `npm run dev` · app (sin `VITE_API_URL` usa datos de ejemplo de `src/services/mock`)
- `npm run dev:movil` · HTTPS en la red local para probar la cámara en el teléfono
- `npm run dev:demo` / `npm run build:demo` · vista previa (la que publica Vercel): inicio con "App del cliente" (marco de teléfono) y "Cocina (KDS)" (pantalla completa)
- `npm run typecheck` y `npm test` · deben pasar antes de dar algo por terminado

## Rutas
`/escanear` (cámara) · `/qr/:token` · `/m/:token` (bienvenida) · `/m/:token/menu` · `/m/:token/menu/producto/:id` ·
`/m/:token/pedido` · `/m/:token/pedido/:id/confirmacion` · `/m/:token/pedido/:id` (estado) · `/m/:token/cuenta`

Cocina: `/cocina/login` · `/cocina` (comandas) · `/cocina/comanda/:id` · `/cocina/pedidos` · `/cocina/notificaciones` · `/cocina/perfil`

## Conexión cliente ↔ cocina
- Estados únicos para ambos: `EstadoPedido` (`services/types.ts`) y `services/estadosPedido.ts`.
- Eventos en vivo solo por `services/tiempoReal.ts`; sin backend, mock entre pestañas en `services/mock/cocinaStore.ts`.

## Pendientes conocidos
Ver la sección "Puntos abiertos" del README (tiempo real con backend, para llevar, endpoints, avisos a mesero y administrador).
