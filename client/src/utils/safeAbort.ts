/**
 * Safe abort utility for preventing runtime error overlays
 * Provides context-aware abort handling with proper error messaging
 */

export interface SafeAbortOptions {
  agentId?: string;
  operation?: string;
  timeout?: number;
  reason?: string;
}

export function safeAbort(
  controller: AbortController,
  options: SafeAbortOptions = {}
): void {
  const {
    agentId = 'unknown',
    operation = 'operation',
    timeout = 10000,
    reason = 'timeout'
  } = options;

  // Check if already aborted to prevent double-abort
  if (controller.signal.aborted) {
    console.warn(`[SafeAbort] Controller already aborted for ${agentId} ${operation}`);
    return;
  }

  try {
    // Provide meaningful error context
    const errorMessage = `${agentId} ${operation} aborted due to ${reason} after ${timeout}ms`;
    controller.abort(new Error(errorMessage));
    
    // Log for debugging but don't trigger overlays
    console.warn(`[SafeAbort] ${errorMessage}`);
  } catch (error) {
    // Silently handle abort errors to prevent overlay triggers
    console.warn(`[SafeAbort] Graceful abort for ${agentId} ${operation}`);
  }
}

export function createSafeAbortController(options: SafeAbortOptions = {}): {
  controller: AbortController;
  safeAbort: () => void;
} {
  const controller = new AbortController();
  
  // Add abort listener for debugging
  controller.signal.addEventListener('abort', () => {
    console.debug(`[SafeAbort] Signal aborted for ${options.agentId || 'unknown'} ${options.operation || 'operation'}`);
  });

  return {
    controller,
    safeAbort: () => safeAbort(controller, options)
  };
}