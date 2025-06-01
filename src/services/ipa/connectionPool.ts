
// Connection pool management for handling high concurrent loads
interface ConnectionPool {
  maxConnections: number;
  activeConnections: number;
  waitingQueue: Array<() => void>;
  connections: Map<string, WebSocket | XMLHttpRequest>;
}

class ConnectionPoolManager {
  private pool: ConnectionPool;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(maxConnections: number = 100) {
    this.pool = {
      maxConnections,
      activeConnections: 0,
      waitingQueue: [],
      connections: new Map()
    };
  }

  async acquireConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.pool.activeConnections < this.pool.maxConnections) {
        const connectionId = this.createConnection();
        resolve(connectionId);
      } else {
        // Queue the request if pool is full
        this.pool.waitingQueue.push(() => {
          const connectionId = this.createConnection();
          resolve(connectionId);
        });
      }
    });
  }

  private createConnection(): string {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.pool.activeConnections++;
    
    // Simulate connection cleanup after use
    setTimeout(() => {
      this.releaseConnection(connectionId);
    }, 30000); // 30 second timeout
    
    return connectionId;
  }

  releaseConnection(connectionId: string): void {
    if (this.pool.connections.has(connectionId)) {
      this.pool.connections.delete(connectionId);
      this.pool.activeConnections--;
      
      // Process waiting queue
      if (this.pool.waitingQueue.length > 0) {
        const nextRequest = this.pool.waitingQueue.shift();
        if (nextRequest) {
          nextRequest();
        }
      }
    }
  }

  getPoolStatus() {
    return {
      active: this.pool.activeConnections,
      max: this.pool.maxConnections,
      waiting: this.pool.waitingQueue.length,
      utilization: (this.pool.activeConnections / this.pool.maxConnections) * 100
    };
  }
}

export const connectionPool = new ConnectionPoolManager(500); // Increased pool size
