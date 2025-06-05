interface PerformanceMetric {
  method: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  trackApiCall(method: string, duration: number, success: boolean): void {
    const metric: PerformanceMetric = {
      method,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    console.log(`⚡ Performance: ${method} - ${duration.toFixed(2)}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  getMetrics(method?: string): PerformanceMetric[] {
    if (method) {
      return this.metrics.filter(m => m.method === method);
    }
    return [...this.metrics];
  }

  getAverageTime(method: string): number {
    const methodMetrics = this.getMetrics(method);
    if (methodMetrics.length === 0) return 0;
    
    const totalTime = methodMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / methodMetrics.length;
  }

  getSuccessRate(method: string): number {
    const methodMetrics = this.getMetrics(method);
    if (methodMetrics.length === 0) return 0;
    
    const successCount = methodMetrics.filter(m => m.success).length;
    return (successCount / methodMetrics.length) * 100;
  }
}

export const performanceMonitor = new PerformanceMonitor();
