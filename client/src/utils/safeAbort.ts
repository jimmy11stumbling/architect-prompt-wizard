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
    return;
  }

  try {
    // Simply abort with a non-error reason to prevent runtime overlay
    // Using a string reason instead of Error object prevents the overlay
    controller.abort(`${agentId} ${operation} aborted due to ${reason || 'timeout'}`);
    
    // Log for debugging only
    console.debug(`[SafeAbort] ${agentId} ${operation} aborted due to ${reason} after ${timeout}ms`);
  } catch (error) {
    // Silently handle any errors
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