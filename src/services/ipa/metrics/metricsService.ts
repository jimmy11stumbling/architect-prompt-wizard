
import { connectionPool } from "../connectionPool";
import { requestBatcher } from "../requestBatcher";
import { cacheService } from "../cacheService";
import { performanceMonitor } from "../performanceMonitor";
import { SystemMetrics } from "../types/serviceTypes";

export class MetricsService {
  static getSystemMetrics(): SystemMetrics {
    return {
      connectionPool: connectionPool.getPoolStatus(),
      requestBatcher: requestBatcher.getBatchStats(),
      cache: cacheService.getStats(),
      performance: performanceMonitor.getMetricsSummary()
    };
  }

  static async healthCheck(): Promise<{ status: string; metrics: any }> {
    const startTime = performance.now();
    
    try {
      const metrics = this.getSystemMetrics();
      const performanceBudget = performanceMonitor.checkPerformanceBudget();
      
      const status = performanceBudget.passed ? 'healthy' : 'degraded';
      
      performanceMonitor.trackApiCall('healthCheck', performance.now() - startTime, true);
      
      return {
        status,
        metrics: {
          ...metrics,
          performanceBudget,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      performanceMonitor.trackApiCall('healthCheck', performance.now() - startTime, false);
      return {
        status: 'unhealthy',
        metrics: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}
