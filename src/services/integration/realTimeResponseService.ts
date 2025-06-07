export interface RealTimeResponse {
  id: string;
  source: string;
  status: "processing" | "success" | "error" | "validation";
  message: string;
  timestamp: number;
  data?: any;
}

export class RealTimeResponseService {
  private static instance: RealTimeResponseService;
  private responses: RealTimeResponse[] = [];
  private maxResponses = 1000; // Keep last 1000 responses

  static getInstance(): RealTimeResponseService {
    if (!RealTimeResponseService.instance) {
      RealTimeResponseService.instance = new RealTimeResponseService();
    }
    return RealTimeResponseService.instance;
  }

  addResponse(response: Omit<RealTimeResponse, "id" | "timestamp">): void {
    const newResponse: RealTimeResponse = {
      ...response,
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.responses.push(newResponse);

    // Keep only the most recent responses
    if (this.responses.length > this.maxResponses) {
      this.responses = this.responses.slice(-this.maxResponses);
    }

    // Log to console for development
    const emoji = response.status === "success" ? "✅" : 
                  response.status === "error" ? "❌" : 
                  response.status === "processing" ? "🔄" : "ℹ️";
    
    console.log(`${emoji} [${response.source}] ${response.message}`, response.data || "");
  }

  getResponses(): RealTimeResponse[] {
    return [...this.responses];
  }

  getResponsesBySource(source: string): RealTimeResponse[] {
    return this.responses.filter(r => r.source === source);
  }

  getResponsesByStatus(status: RealTimeResponse["status"]): RealTimeResponse[] {
    return this.responses.filter(r => r.status === status);
  }

  clearResponses(): void {
    this.responses = [];
  }

  getResponseCount(): number {
    return this.responses.length;
  }
}

export const realTimeResponseService = RealTimeResponseService.getInstance();
