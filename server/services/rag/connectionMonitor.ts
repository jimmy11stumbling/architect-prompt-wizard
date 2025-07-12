
class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionCount = 0;
  private maxConnections = 3;
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
    
    // Wait if too many connections
    while (this.connectionCount >= this.maxConnections) {
      console.log(`[ConnectionMonitor] Max connections reached (${this.maxConnections}), waiting...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.connectionCount++;
    console.log(`[ConnectionMonitor] Acquired connection ${this.connectionCount}/${this.maxConnections} for: ${key}`);
    
    const operationPromise = operation()
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
