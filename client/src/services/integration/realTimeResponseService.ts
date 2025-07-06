export interface RealTimeResponse {
  id: string;
  source: string;
  status: "processing" | "success" | "error" | "warning";
  message: string;
  data?: any;
  timestamp: number;
}

export class RealTimeResponseService {
  private static instance: RealTimeResponseService;
  private responses: RealTimeResponse[] = [];
  private listeners: Set<(response: RealTimeResponse) => void> = new Set();
  private maxResponses = 100;

  static getInstance(): RealTimeResponseService {
    if (!RealTimeResponseService.instance) {
      RealTimeResponseService.instance = new RealTimeResponseService();
    }
    return RealTimeResponseService.instance;
  }

  addResponse(response: Omit<RealTimeResponse, "id" | "timestamp">): void {
    const fullResponse: RealTimeResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...response
    };

    this.responses.unshift(fullResponse);
    
    // Keep only the most recent responses
    if (this.responses.length > this.maxResponses) {
      this.responses = this.responses.slice(0, this.maxResponses);
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(fullResponse);
      } catch (error) {
        console.error("Error in real-time response listener:", error);
      }
    });

    // Also log to console for debugging
    console.log(`🔄 [${response.source}] ${response.message}`, response.data || '');
  }

  getResponses(limit: number = 50): RealTimeResponse[] {
    return this.responses.slice(0, limit);
  }

  getResponsesBySource(source: string, limit: number = 20): RealTimeResponse[] {
    return this.responses
      .filter(response => response.source === source)
      .slice(0, limit);
  }

  clearResponses(): void {
    this.responses = [];
    this.addResponse({
      source: "system",
      status: "success",
      message: "Response history cleared"
    });
  }

  subscribe(listener: (response: RealTimeResponse) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Alias for subscribe to maintain compatibility
  onUpdate(listener: (response: RealTimeResponse) => void): () => void {
    return this.subscribe(listener);
  }

  getStats(): {
    totalResponses: number;
    responsesByStatus: Record<string, number>;
    responsesBySource: Record<string, number>;
    recentActivity: number;
  } {
    const now = Date.now();
    const recentThreshold = now - (5 * 60 * 1000); // Last 5 minutes

    const responsesByStatus: Record<string, number> = {};
    const responsesBySource: Record<string, number> = {};
    let recentActivity = 0;

    this.responses.forEach(response => {
      // Count by status
      responsesByStatus[response.status] = (responsesByStatus[response.status] || 0) + 1;
      
      // Count by source
      responsesBySource[response.source] = (responsesBySource[response.source] || 0) + 1;
      
      // Count recent activity
      if (response.timestamp > recentThreshold) {
        recentActivity++;
      }
    });

    return {
      totalResponses: this.responses.length,
      responsesByStatus,
      responsesBySource,
      recentActivity
    };
  }
}

export const realTimeResponseService = RealTimeResponseService.getInstance();
