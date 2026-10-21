# Cómo seguir este proyecto en Claude Code

No hace falta "convertir" nada: Claude Code trabaja directo sobre la carpeta del proyecto.
El archivo `CLAUDE.md` de la raíz ya le explica el proyecto y las reglas, y lo lee solo al empezar.

## Opción A · En tu computadora (recomendada)

1. Instala Node.js 20 o superior: https://nodejs.org
2. Instala Claude Code (en una terminal):
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
3. Descomprime `frontend-cliente.zip` y entra a la carpeta:
   ```bash
   cd frontend-cliente
   npm install
   npm run dev        # abre http://localhost:5173/escanear
   ```
4. En otra terminal, dentro de la misma carpeta, abre Claude Code:
   ```bash
   claude
   ```
   La primera vez te pide iniciar sesión con tu cuenta de Claude.
5. Pega el prompt de abajo.

## Opción B · Claude Code en la web (sin instalar)

1. Sube la carpeta a un repositorio de GitHub (por ejemplo `foodsync-frontend`).
2. Entra a https://claude.ai/code, conecta GitHub y elige ese repositorio.
3. Pega el prompt de abajo. Claude Code trabaja en la nube y te abre un pull request con los cambios.

## Prompt para empezar

```
Lee CLAUDE.md y README.md. Este es el frontend del comensal de FoodSync
(React + TypeScript + Vite + Tailwind), ya con las 8 pantallas del flujo.
1. Corre npm install, npm run typecheck y npm test, y dime si todo pasa.
2. Explícame en 5 líneas cómo está organizado el código.
3. No cambies el diseño ni agregues funciones fuera de los requerimientos;
   si algo no está claro, pregúntame antes.
Después te diré qué pantalla o función sigue.
```

## Probar la cámara en tu teléfono

El navegador del teléfono solo da la cámara con HTTPS:

```bash
npm run dev:movil
```

Abre en el teléfono la dirección `https://<ip-de-tu-computadora>:5173/escanear` (misma red wifi),
acepta el aviso del certificado de desarrollo y apunta al QR de prueba de la vista previa.

## Ideas de siguientes prompts

- "Conecta `src/services` al API Gateway de Bibiana; estos son los endpoints: …"
- "Cambia `usePedido` para recibir el estado por WebSocket/SSE en lugar de consultar cada 10 s."
- "Agrega pruebas con Playwright del flujo QR → menú → pedido → pago."
