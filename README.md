# FoodSync · Web Cliente (comensal) y Cocina (KDS)

Las 8 pantallas del flujo del comensal del lienzo FoodSync (cap. 12 · Web Cliente) y la pantalla de cocina (KDS, lienzo 14), en código y conectadas entre sí.
Stack según la tesis (Anexo D): **TypeScript + React + Vite**, **Tailwind CSS**, **React Router**, **Zod**, **Vitest**.

## Cómo correrlo

```bash
npm install
npm run dev          # app real (sin VITE_API_URL usa datos de ejemplo)
npm run dev:demo     # vista previa: inicio con "App del cliente" y "Cocina (KDS)", datos de ejemplo
npm test             # pruebas (carrito, cuenta, estados, filtros y tiempos del KDS, mock compartido)
npm run build        # producción en dist/
```

Entrada: el QR de cada mesa apunta a `/qr/<token>` (o directo a `/m/<token>`).
Con datos de ejemplo prueba `/qr/casa-olivo-centro-m7`. La cocina está en `/cocina`.

### Probar la conexión cliente ↔ cocina (vista previa)

1. Abre la vista previa y entra a **Cocina (KDS)**; inicia sesión con Original Auth y elige una cuenta de prueba.
2. En **otra pestaña del mismo navegador** abre **App del cliente** → Ver el menú → Tu pedido → **Enviar pedido a cocina**.
3. En la cocina aparece el aviso **Nuevo pedido · Mesa 7** y la comanda en **Pendientes** (una por área si el pedido trae platos de varias).
4. En el cliente toca **Ver estado del pedido**; en la cocina toca **Empezar preparación**, **Marcar como listo** y **Marcar entregado**: el estado del cliente cambia solo.

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

### Cocina · KDS (tablet horizontal o escritorio, desde 1024 px; en 768 px vertical se reacomoda)

| Pantalla | Ruta | Requerimiento |
|---|---|---|
| Inicio de sesión del personal (Original Auth; cuentas de prueba sin backend) | `/cocina/login` | RF2 |
| Comandas: Pendientes / En preparación / Listos, área, contadores que filtran, reloj, entregados hace poco, aviso de nuevo pedido | `/cocina` | RF10 |
| Detalle de comanda: platos con variantes y extras, observaciones, horas, cancelar platillo con motivo | `/cocina/comanda/:id` | RF10 |
| Pedidos: historial del turno con búsqueda y filtros por estado, área y canal | `/cocina/pedidos` | RF10 |
| Notificaciones: nuevos pedidos, cancelaciones y retrasos; marcar como leída | `/cocina/notificaciones` | RF10 |
| Mi perfil: nombre, rol, área asignada y turno | `/cocina/perfil` | RF2 |
| Salir: confirmación y regreso al inicio de sesión | (desde el sidebar) | RF2 |

Tiempo transcurrido con color: miel desde 15 min y paprika desde 25 min (a los 25 min también llega un aviso de retraso).
Debajo de 1280 px el sidebar de 220 px pasa a riel de iconos para que las tarjetas mantengan sus 260 px.

## Estructura (feature-first, Anexo D §5)

```
src/
  app/          App.tsx (rutas), rutas.ts
  features/
    mesa/       QR, bienvenida, contexto de la mesa (token → restaurante, sucursal, mesa)
    menu/       menú, detalle de producto, tarjetas, barra del pedido
    pedido/     carrito (reducer + contexto), Tu pedido, confirmación, estado
    pagos/      cuenta, propina, método de pago, calcularCuenta()
    cocina/     KDS: CocinaApp (rutas /cocina), pages/, components/, hooks/ (sesión y datos en vivo), lib/ (filtros, tiempos)
  services/     clientes REST al API Gateway + esquemas Zod + datos de ejemplo (mock/)
                tiempoReal.ts (canal en vivo), cocinaService.ts, sesionCocinaService.ts, estadosPedido.ts
  shared/       ui/ (Button, Icon, Pill, ChoiceRow, QuantityStepper, FoodImage…), layout/, lib/
  styles/       tokens.css (paquete FoodSync + colores del KDS del lienzo 14) + index.css
  demo/         solo para la vista previa (inicio con los dos accesos, marco de teléfono para el cliente)
```

Colores, tipografías, radios y sombras salen de `styles/tokens.css`; `tailwind.config.ts` solo los expone como clases.
Los iconos son los 24 × 24 de `foodsync/icons` (en `shared/ui/Icon.tsx`). Se usan en lugar de Lucide para mantener la identidad.

## Conexión con el backend

Define `VITE_API_URL` (ver `.env.example`). Endpoints que espera el front (propuesta, a acordar con backend):

- `GET  /cliente/mesas/:token` → MesaContexto · `GET /cliente/mesas/:token/menu` → Menu
- `POST /cliente/mesas/:token/pedidos` · `GET /cliente/mesas/:token/pedidos` · `GET /cliente/pedidos/:id`
- `POST /cliente/mesas/:token/llamar-mesero` · `POST /cliente/mesas/:token/solicitar-cuenta` · `POST /cliente/mesas/:token/pagos`
- `VITE_ORIGINAL_AUTH_URL` para el inicio de sesión (opcional en el cliente; obligatorio para el personal de cocina).

Cocina (KDS · RF10, propuesta):

- `GET  /cocina/comandas` → Comanda[] · `GET /cocina/comandas/:id` → Comanda
- `PATCH /cocina/comandas/:id` `{ estado }` → Comanda (empezar, listo, entregado)
- `POST /cocina/comandas/:id/lineas/:indice/cancelar` `{ motivo }` → Comanda; el backend avisa al mesero y al administrador
- `GET  /cocina/notificaciones` · `POST /cocina/notificaciones/leidas` `{ ids: string[] | "todas" }`
- `POST /cocina/sesion` `{ code }` → Personal (código que devuelve Original Auth) · `DELETE /cocina/sesion`

Una **comanda** es la parte de un pedido que prepara un área (`caliente`, `fria`, `barra`); el área viene de cada producto (`Producto.area`).
El estado que ve el comensal se calcula con sus comandas (`estadoDelPedido` en `services/estadosPedido.ts`).

### Tiempo real

Las pantallas solo usan `suscribirTiempoReal()` (`src/services/tiempoReal.ts`). Eventos (esquema `EventoTiempoRealSchema`):

| Evento | Cuándo | Quién escucha |
|---|---|---|
| `pedido.creado` `{ pedidoId, comandaIds }` | el comensal envía su pedido | KDS (aviso "Nuevo pedido") |
| `comanda.actualizada` `{ pedidoId, comandaId, estado }` | cocina cambia una comanda | cliente (Estado del pedido) y KDS |
| `platillo.cancelado` `{ pedidoId, comandaId, linea, motivo }` | cocina cancela un platillo | KDS; backend → mesero y administrador |
| `notificaciones.actualizadas` | nuevo aviso (retraso) o leídas | KDS |

- **Sin backend** (vista previa): mock compartido entre pestañas del mismo navegador en `services/mock/cocinaStore.ts` (localStorage + BroadcastChannel).
- **Con backend**: Server-Sent Events en `GET ${VITE_API_URL}/eventos` (un evento JSON por mensaje). Para usar WebSocket basta con cambiar `suscribirTiempoReal`.

## Puntos abiertos (no inventados; hay que confirmarlos)

1. **Botón "Llamar al mesero"** (RF7) no aparece en el diseño; se agregó como icono discreto junto a "Mesa 7" en el menú.
2. **Propina de monto libre** (RF11) no aparece en el diseño; se agregó el enlace "Otro monto".
3. **RF5 pide abrir el menú "sin pasos adicionales"**, pero el diseño pasa por Bienvenida. Se respetó el diseño; si se prefiere, el QR puede apuntar directo a `/m/:token/menu`.
4. **Estados del pedido (unificados)**: cliente y cocina usan un solo tipo, `EstadoPedido` = Pendiente → En preparación → Listo → Entregado, más Cancelado (`services/types.ts`). Difiere de los documentos: el modelo de mesas dice Creado/Enviado y el requerimiento del KDS (Anexo E) dice Nuevo/Aceptado. Equivalencia usada: Nuevo = Pendiente, Aceptado = En preparación. Falta confirmarlo con backend.
5. **Tiempo real**: el cliente y el KDS reciben eventos por `suscribirTiempoReal` (mock entre pestañas; con backend, SSE en `/eventos`). El cliente además consulta cada 10 s por si se pierde un evento. Falta que la arquitectura defina el canal (SSE o WebSocket desde RabbitMQ).
6. **Pedidos para llevar** (RF9): el enlace existe en Bienvenida, pero su flujo (nombre, teléfono, enlace temporal) aún no tiene pantallas.
7. **Moneda e impuestos**: los datos de ejemplo usan pesos mexicanos (`es-MX`, `MXN`: $1,250.00) con IVA 8 % incluido en el precio; son configurables por restaurante (`locale`, `currency`, `tasaImpuesto`).
8. **Cocina (KDS)**: el aviso al mesero y al administrador al cancelar un platillo lo hace el backend (aún no hay apps de mesero ni de administrador). El comprobante y la cuenta ya no cobran los platillos cancelados. Los colores del KDS (espresso, textos claros, notas, botón "listo") se agregaron a `tokens.css` desde el lienzo 14.
