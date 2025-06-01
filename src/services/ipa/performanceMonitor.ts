// Performance monitoring and metrics collection for scalability analysis
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  loadTime: number;
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;
  private startTime: number = performance.now();

  // Track API response times
  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    this.addMetric('api_response_time', duration, {
      endpoint,
      success,
      status: success ? 'success' : 'error'
    });
  }

  // Track component render times
  trackComponentRender(componentName: string, duration: number): void {
    this.addMetric('component_render_time', duration, {
      component: componentName
    });
  }

  // Track user interactions
  trackUserInteraction(action: string, duration?: number): void {
    this.addMetric('user_interaction', duration || 0, {
      action,
      page: window.location.pathname
    });
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.addMetric('memory_usage', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    }
  }

  // Track page load performance
  trackPageLoad(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.addMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, {
        type: 'full_page_load'
      });
    }
  }

  private addMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }
  }

  // Get performance summary
  getMetricsSummary(): SystemMetrics {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);

    const apiMetrics = recentMetrics.filter(m => m.name === 'api_response_time');
    const memoryMetrics = recentMetrics.filter(m => m.name === 'memory_usage');
    const errorMetrics = apiMetrics.filter(m => !m.metadata?.success);

    const avgApiResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    const currentMemory = memoryMetrics.length > 0 
      ? memoryMetrics[memoryMetrics.length - 1].value 
      : 0;

    const errorRate = apiMetrics.length > 0 
      ? (errorMetrics.length / apiMetrics.length) * 100 
      : 0;

    return {
      memoryUsage: currentMemory,
      cpuUsage: 0, // Would need Web Workers to estimate
      loadTime: performance.now() - this.startTime,
      apiResponseTime: avgApiResponseTime,
      errorRate,
      activeUsers: this.estimateActiveUsers()
    };
  }

  private estimateActiveUsers(): number {
    // Simple heuristic based on recent user interactions
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    const recentInteractions = this.metrics.filter(
      m => m.name === 'user_interaction' && m.timestamp > last5Minutes
    );
    
    return Math.min(recentInteractions.length, 500000); // Cap at our target
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear old metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Performance budget checker
  checkPerformanceBudget(): { passed: boolean; violations: string[] } {
    const summary = this.getMetricsSummary();
    const violations: string[] = [];

    if (summary.apiResponseTime > 2000) {
      violations.push('API response time exceeds 2s budget');
    }

    if (summary.errorRate > 5) {
      violations.push('Error rate exceeds 5% budget');
    }

    if (summary.memoryUsage > 50 * 1024 * 1024) { // 50MB
      violations.push('Memory usage exceeds 50MB budget');
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-track page load
document.addEventListener('DOMContentLoaded', () => {
  performanceMonitor.trackPageLoad();
});

// Auto-track memory every 30 seconds
setInterval(() => {
  performanceMonitor.trackMemoryUsage();
}, 30000);
