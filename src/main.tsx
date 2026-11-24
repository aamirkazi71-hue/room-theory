import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { getLocale, loadLocale, useLocale } from './i18n';
import './styles/index.css';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/** Re-mount the app when the language changes so every string and layout direction updates at once. */
function LocaleRoot() {
  const locale = useLocale((s) => s.locale);
  return <App key={locale} />;
}

// Load the visitor's language before the first render (Arabic is a separate chunk).
void loadLocale(getLocale()).then(() => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <LocaleRoot />
    </BrowserRouter>
  </StrictMode>,
));
