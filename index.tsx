
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount into. Check index.html.");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("FATAL ERROR DURING MOUNT:", error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #991b1b; border-radius: 8px; margin: 20px; font-family: sans-serif;">
        <h1 style="font-size: 18px; margin-bottom: 8px;">ERROR CRITICO DE CARGA</h1>
        <p style="font-size: 14px; opacity: 0.8;">${error instanceof Error ? error.message : 'Error desconocido'}</p>
        <button onclick="window.location.reload()" style="margin-top: 12px; padding: 8px 16px; background: white; color: #991b1b; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">REINTENTAR</button>
      </div>
    `;
  }
}
