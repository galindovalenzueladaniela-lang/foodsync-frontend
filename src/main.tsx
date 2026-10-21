import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { ToastProvider } from './shared/ui/Toast';
import './styles/index.css';

const root = createRoot(document.getElementById('root')!);

if (import.meta.env.VITE_DEMO === 'true') {
  // Vista previa: marco de teléfono, navegación por pasos y datos de ejemplo.
  import('./demo/DemoShell').then(({ DemoShell }) => root.render(<StrictMode><DemoShell /></StrictMode>));
} else {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <div className="relative">
          <ToastProvider><App /></ToastProvider>
        </div>
      </BrowserRouter>
    </StrictMode>,
  );
}
