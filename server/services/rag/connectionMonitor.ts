
class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionCount = 0;
  private maxConnections = 1;
  private connectionPromises = new Map<string, Promise<any>>();
  
  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }
  
  async acquireConnection<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // Check if operation is already running
    if (this.connectionPromises.has(key)) {
      console.log(`[ConnectionMonitor] Reusing existing operation: ${key}`);
      return this.connectionPromises.get(key) as Promise<T>;
    }
    
    // Wait if too many connections with timeout
    let waitCount = 0;
    while (this.connectionCount >= this.maxConnections && waitCount < 10) {
      console.log(`[ConnectionMonitor] Max connections reached (${this.maxConnections}), waiting...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      waitCount++;
    }
    
    if (waitCount >= 10) {
      console.warn(`[ConnectionMonitor] Force releasing stuck connections`);
      this.connectionCount = 0;
      this.connectionPromises.clear();
    }
    
    this.connectionCount++;
    console.log(`[ConnectionMonitor] Acquired connection ${this.connectionCount}/${this.maxConnections} for: ${key}`);
    
    const operationPromise = operation()
      .catch(error => {
        // Handle Neon-specific errors gracefully
        if (error?.message?.includes('ErrorEvent') || error?.message?.includes('WebSocket')) {
          console.warn(`[ConnectionMonitor] Neon connection error for ${key}, continuing with degraded functionality:`, error.message);
          return null; // Return null instead of throwing
        }
        throw error;
      })
      .finally(() => {
        this.connectionCount--;
        this.connectionPromises.delete(key);
        console.log(`[ConnectionMonitor] Released connection, active: ${this.connectionCount}/${this.maxConnections}`);
      });
    
    this.connectionPromises.set(key, operationPromise);
    return operationPromise;
  }
  
  getActiveConnections(): number {
    return this.connectionCount;
  }
}

export const connectionMonitor = ConnectionMonitor.getInstance();
