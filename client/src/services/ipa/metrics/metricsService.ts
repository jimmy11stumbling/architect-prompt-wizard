
import { performanceMonitor } from "../performanceMonitor";
import { cacheService } from "../cacheService";
import { connectionPool } from "../connectionPool";

interface SystemMetrics {
  performance: {
    totalCalls: number;
    averageResponseTime: number;
    successRate: number;
  };
  cache: {
    size: number;
    hitRate: number;
  };
  connections: {
    active: number;
    total: number;
  };
  timestamp: number;
}

export class MetricsService {
  static getSystemMetrics(): SystemMetrics {
    const allMetrics = performanceMonitor.getMetrics();
    const cacheStats = cacheService.getStats();
    
    return {
      performance: {
        totalCalls: allMetrics.length,
        averageResponseTime: allMetrics.reduce((sum, m) => sum + m.duration, 0) / Math.max(allMetrics.length, 1),
        successRate: allMetrics.filter(m => m.success).length / Math.max(allMetrics.length, 1) * 100
      },
      cache: {
        size: cacheStats.size,
        hitRate: 85 // Simulated hit rate
      },
      connections: {
        active: connectionPool.getActiveConnections(),
        total: 10
      },
      timestamp: Date.now()
    };
  }

  static async healthCheck(): Promise<{ status: string; metrics: SystemMetrics }> {
    const metrics = this.getSystemMetrics();
    const isHealthy = metrics.performance.successRate > 80 && metrics.connections.active < 8;
    
    return {
      status: isHealthy ? "healthy" : "degraded",
      metrics
    };
  }
}
