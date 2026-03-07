import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear any stale data on app load
console.log('🚀 GeoSentinel Frontend Initializing...');
console.log('📅 Build Time:', new Date().toISOString());
console.log('🌐 Environment:', import.meta.env.MODE);
console.log('📡 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

// Clear old cache if app version changed
const APP_VERSION = '2.0.0';
const storedVersion = localStorage.getItem('app_version');
if (storedVersion !== APP_VERSION) {
  console.log('🔄 New version detected, clearing cache...');
  const keysToKeep = ['geosentinel-theme']; // Preserve theme
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('app_version', APP_VERSION);
  console.log('✅ Cache cleared');
}

createRoot(document.getElementById("root")!).render(<App />);
