import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@codecraft/ui';
import '@codecraft/ui/styles.css';
import './styles/global.css';
import { App } from './App.js';

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root not found');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="teens">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
