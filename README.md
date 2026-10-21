# FoodSync · Web Cliente (comensal)

Las 8 pantallas del flujo del comensal del lienzo FoodSync (cap. 12 · Web Cliente), en código.
Stack según la tesis (Anexo D): **TypeScript + React + Vite**, **Tailwind CSS**, **React Router**, **Zod**, **Vitest**.

## Cómo correrlo

```bash
npm install
npm run dev          # app real (sin VITE_API_URL usa datos de ejemplo)
npm run dev:demo     # vista previa con marco de teléfono y datos de ejemplo
npm test             # pruebas de carrito y cuenta
npm run build        # producción en dist/
```

Entrada: el QR de cada mesa apunta a `/qr/<token>` (o directo a `/m/<token>`).
Con datos de ejemplo prueba `/qr/casa-olivo-centro-m7`.

## Pantallas y rutas

| Paso | Pantalla | Ruta | Requerimiento (Anexo E) |
|---|---|---|---|
| 1 | Acceso por QR (cámara real con jsQR, o enlace del QR) | `/escanear` · `/qr/:token` | RF5 |
| 2 | Bienvenida (invitado / Original Auth) | `/m/:token` | RF2, RF3 |
| 3 | Menú digital | `/m/:token/menu` | RF3, RF4, RF7 (llamar al mesero) |
| 4 | Detalle del producto | `/m/:token/menu/producto/:id` | RF4 (variante, extras, observaciones) |
| 5 | Tu pedido | `/m/:token/pedido` | RF7 |
| 6 | Confirmación | `/m/:token/pedido/:id/confirmacion` | RF7 |
| 7 | Estado del pedido | `/m/:token/pedido/:id` | RF7 |
| 8 | Pago y propina | `/m/:token/cuenta` | RF6, RF7 (pedir cuenta), RF11 |

## Estructura (feature-first, Anexo D §5)

```
src/
  app/          App.tsx (rutas), rutas.ts
  features/
    mesa/       QR, bienvenida, contexto de la mesa (token → restaurante, sucursal, mesa)
    menu/       menú, detalle de producto, tarjetas, barra del pedido
    pedido/     carrito (reducer + contexto), Tu pedido, confirmación, estado
    pagos/      cuenta, propina, método de pago, calcularCuenta()
  services/     clientes REST al API Gateway + esquemas Zod + datos de ejemplo (mock/)
  shared/       ui/ (Button, Icon, Pill, ChoiceRow, QuantityStepper, FoodImage…), layout/, lib/
  styles/       tokens.css (paquete FoodSync, sin cambios) + index.css
  demo/         solo para la vista previa
```

Colores, tipografías, radios y sombras salen de `styles/tokens.css`; `tailwind.config.ts` solo los expone como clases.
Los iconos son los 24 × 24 de `foodsync/icons` (en `shared/ui/Icon.tsx`). Se usan en lugar de Lucide para mantener la identidad.

## Conexión con el backend

Define `VITE_API_URL` (ver `.env.example`). Endpoints que espera el front (propuesta, a acordar con backend):

- `GET  /cliente/mesas/:token` → MesaContexto · `GET /cliente/mesas/:token/menu` → Menu
- `POST /cliente/mesas/:token/pedidos` · `GET /cliente/mesas/:token/pedidos` · `GET /cliente/pedidos/:id`
- `POST /cliente/mesas/:token/llamar-mesero` · `POST /cliente/mesas/:token/solicitar-cuenta` · `POST /cliente/mesas/:token/pagos`
- `VITE_ORIGINAL_AUTH_URL` para el inicio de sesión opcional.

## Puntos abiertos (no inventados; hay que confirmarlos)

1. **Botón "Llamar al mesero"** (RF7) no aparece en el diseño; se agregó como icono discreto junto a "Mesa 7" en el menú.
2. **Propina de monto libre** (RF11) no aparece en el diseño; se agregó el enlace "Otro monto".
3. **RF5 pide abrir el menú "sin pasos adicionales"**, pero el diseño pasa por Bienvenida. Se respetó el diseño; si se prefiere, el QR puede apuntar directo a `/m/:token/menu`.
4. **Estados del pedido**: el diseño usa Pendiente → En preparación → Listo → Entregado; los documentos usan Creado/Enviado (modelo de mesas) y Nuevo/Aceptado (KDS). Hay que unificar nombres.
5. **Tiempo real**: el estado se consulta cada 10 s (`usePedido`). El canal push (SSE/WebSocket desde RabbitMQ) no está definido en la arquitectura.
6. **Pedidos para llevar** (RF9): el enlace existe en Bienvenida, pero su flujo (nombre, teléfono, enlace temporal) aún no tiene pantallas.
7. **Moneda e impuestos**: el diseño usa pesos con IVA 8 % incluido en el precio; son configurables por restaurante (`locale`, `currency`, `tasaImpuesto`).
