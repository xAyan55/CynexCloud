import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AppProviders from '@/app/providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.css';

console.log('[CynexCloud] App initializing...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
