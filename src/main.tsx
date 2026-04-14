import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// i18n setup — must import before App renders
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './i18n/ar';
import fr from './i18n/fr';
import en from './i18n/en';

i18next.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: 'ar',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
