import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `--mode movil` sirve por HTTPS en la red local: el teléfono solo entrega la cámara con HTTPS.
// `--mode demo` genera un solo HTML autocontenido (vista previa con marco de teléfono y datos de ejemplo).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'demo' ? [viteSingleFile()] : []), ...(mode === 'movil' ? [basicSsl()] : [])],
  build: { outDir: mode === 'demo' ? 'dist-demo' : 'dist' },
  test: { environment: 'node' },
}));
