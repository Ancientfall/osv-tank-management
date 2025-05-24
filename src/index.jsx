// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import EnhancedOSVTankManagement from './components/EnhancedOSVTankManagement';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <EnhancedOSVTankManagement />
    </React.StrictMode>
  );
} else {
  console.error("Fatal Error: The root element with ID 'root' was not found in your index.html. React cannot mount.");
}