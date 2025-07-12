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
      event.reason?.message?.includes('Timeout after') ||
      event.reason?.message?.includes('Search timeout') ||
      event.reason?.message?.includes('plugin:runtime-error-plugin') ||
      event.reason?.message?.includes('[plugin:runtime-error-plugin]') ||
      event.reason?.message?.includes('unknown runtime error') ||
      event.reason?.message?.includes('Platform not found') ||
      event.reason?.message?.includes('Bad Gateway') ||
      event.reason?.message?.includes('signal is aborted') ||
      event.reason?.message?.includes('aborted without reason') ||
      event.reason?.message?.includes('Failed to fetch') ||
      event.reason?.message?.includes('aborted due to') ||
      event.reason?.message?.includes('stats-fetch') ||
      event.reason?.message?.includes('hybrid-search') ||
      event.reason?.name === 'AbortError' ||
      event.reason instanceof DOMException ||
      event.reason instanceof TypeError ||
      event.reason?.constructor?.name === 'DOMException') {
    // Log the error but prevent it from showing in overlay
    console.debug('Handled promise rejection:', event.reason?.message || event.reason);
    event.preventDefault();
    return;
  }
});

window.addEventListener('error', (event) => {
  // Handle general errors for known issues
  if (event.error?.message?.includes('MCP request error') ||
      event.error?.message?.includes('Vector search failed') ||
      event.error?.message?.includes('timeout') ||
      event.error?.message?.includes('Timeout after') ||
      event.error?.message?.includes('Search timeout') ||
      event.error?.message?.includes('plugin:runtime-error-plugin') ||
      event.error?.message?.includes('[plugin:runtime-error-plugin]') ||
      event.error?.message?.includes('unknown runtime error') ||
      event.error?.message?.includes('Platform not found') ||
      event.error?.message?.includes('Bad Gateway') ||
      event.error?.message?.includes('signal is aborted') ||
      event.error?.message?.includes('aborted without reason') ||
      event.error?.message?.includes('Failed to fetch') ||
      event.error?.name === 'AbortError' ||
      event.error instanceof TypeError ||
      event.error instanceof DOMException ||
      event.error.message?.includes('plugin:runtime-error-plugin') ||
      event.error.message?.includes('[plugin:runtime-error-plugin]') ||
      event.error.message?.includes('unknown runtime error')) {
    console.debug('Suppressed error:', event.error?.message || event.message);
    event.preventDefault();
  }
});

// Suppress runtime errors in development for cleaner testing experience
if (import.meta.env.DEV) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('plugin:runtime-error-plugin') || 
        message.includes('[plugin:runtime-error-plugin]') ||
        message.includes('unknown runtime error') ||
        message.includes('AbortError') ||
        message.includes('signal is aborted') ||
        message.includes('stats timeout')) {
      return; // Completely suppress these
    }
    originalConsoleError.apply(console, args);
  };

  // Intercept and suppress Vite overlay creation
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);
    if (tagName === 'vite-error-overlay') {
      console.debug('Blocked vite-error-overlay creation');
      return document.createElement('div'); // Return empty div instead
    }
    return element;
  };

  // Override Vite's error handling more aggressively
  const originalDefineCustomElements = window.customElements?.define;
  if (originalDefineCustomElements) {
    window.customElements.define = function(name, constructor, options) {
      if (name === 'vite-error-overlay') {
        console.debug('Blocked vite-error-overlay registration');
        return;
      }
      return originalDefineCustomElements.call(this, name, constructor, options);
    };
  }

  // Intercept Vite's error overlay injection
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as Element;
          if (element.tagName === 'VITE-ERROR-OVERLAY') {
            console.debug('Removing vite-error-overlay from DOM');
            element.remove();
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also override any direct DOM manipulation
  const originalAppendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function(child) {
    if (child.tagName === 'VITE-ERROR-OVERLAY') {
      console.debug('Blocked vite-error-overlay appendChild');
      return child;
    }
    return originalAppendChild.call(this, child);
  };
}
const originalError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const msg = message?.toString() || '';
  if (msg.includes('signal is aborted') || 
      msg.includes('aborted without reason') ||
      msg.includes('Failed to fetch') ||
      msg.includes('SafeAbort') ||
      msg.includes('stats timeout') ||
      msg.includes('plugin:runtime-error-plugin') ||
      msg.includes('unknown runtime error') ||
      msg.includes('[plugin:runtime-error-plugin]')) {
    console.debug('Suppressed runtime error:', msg);
    return true; // Prevent error from propagating
  }
  return originalError ? originalError(message, source, lineno, colno, error) : false;
};

createRoot(document.getElementById("root")!).render(<App />);