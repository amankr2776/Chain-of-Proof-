import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress harmless Vite HMR WebSocket disconnect errors in preview environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('WebSocket') ||
        event.reason?.toString?.().includes('WebSocket'))
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
