
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to prevent runtime error overlay for known issues
window.addEventListener('unhandledrejection', (event) => {
  // Handle promise rejections gracefully for known issues
  if (event.reason?.message?.includes('MCP request error') ||
      event.reason?.message?.includes('Vector search failed') ||
      event.reason?.message?.includes('timeout') ||
      event.reason?.message?.includes('plugin:runtime-error-plugin') ||
      event.reason?.message?.includes('unknown runtime error') ||
      event.reason?.name === 'AbortError') {
    // Log the error but prevent it from showing in overlay
    console.warn('Handled promise rejection:', event.reason);
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  // Handle general errors for known issues
  if (event.error?.message?.includes('MCP request error') ||
      event.error?.message?.includes('Vector search failed') ||
      event.error?.message?.includes('timeout') ||
      event.error?.message?.includes('plugin:runtime-error-plugin') ||
      event.error?.message?.includes('unknown runtime error')) {
    console.warn('Handled error:', event.error);
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
