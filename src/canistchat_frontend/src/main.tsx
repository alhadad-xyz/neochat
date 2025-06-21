import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import EmbedRoute from './components/EmbedRoute';
import { ThemeProvider } from './components/sections/ThemeProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/embed" element={<EmbedRoute />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
); 