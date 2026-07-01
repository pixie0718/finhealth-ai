import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the PWA service worker so the app is installable and works offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`).catch(() => {});
  });
}

// Capture the install prompt as early as possible (it can fire before React mounts)
// so the in-app Install banner can trigger it on demand.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
  window.dispatchEvent(new Event("fh-installable"));
});
