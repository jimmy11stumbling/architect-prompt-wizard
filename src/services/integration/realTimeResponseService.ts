import { toast } from "@/hooks/use-toast";

export interface RealTimeResponse {
  id: string;
  timestamp: number;
  source: string;
  status: "processing" | "success" | "error" | "validation";
  message: string;
  data?: any;
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class RealTimeResponseService {
  private static instance: RealTimeResponseService;
  private responses: RealTimeResponse[] = [];
  private listeners: ((response: RealTimeResponse) => void)[] = [];

  static getInstance(): RealTimeResponseService {
    if (!RealTimeResponseService.instance) {
      RealTimeResponseService.instance = new RealTimeResponseService();
    }
    return RealTimeResponseService.instance;
  }

  addResponse(response: Omit<RealTimeResponse, "id" | "timestamp">): RealTimeResponse {
    const fullResponse: RealTimeResponse = {
      ...response,
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.responses.push(fullResponse);
    
    // Console validation and logging
    this.validateAndLog(fullResponse);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(fullResponse));
    
    // Keep only last 100 responses
    if (this.responses.length > 100) {
      this.responses = this.responses.slice(-100);
    }

    return fullResponse;
  }

  private validateAndLog(response: RealTimeResponse): void {
    const timestamp = new Date(response.timestamp).toISOString();
    
    console.group(`🔄 Real-Time Response [${response.source}] - ${timestamp}`);
    console.log("📊 Response ID:", response.id);
    console.log("🎯 Status:", response.status);
    console.log("💬 Message:", response.message);
    
    if (response.data) {
      console.log("📦 Data:", response.data);
    }

    // Validation logic
    const validation = this.performValidation(response);
    response.validationResult = validation;

    if (validation.isValid) {
      console.log("✅ Validation: PASSED");
    } else {
      console.log("❌ Validation: FAILED");
      validation.errors.forEach(error => console.error("  🚨 Error:", error));
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => console.warn("  ⚠️ Warning:", warning));
    }

    console.groupEnd();

    // Show toast for critical errors
    if (!validation.isValid && response.status === "error") {
      toast({
        title: `Validation Failed - ${response.source}`,
        description: validation.errors.join(", "),
        variant: "destructive"
      });
    }
  }

  private performValidation(response: RealTimeResponse): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!response.message || response.message.trim().length === 0) {
      errors.push("Response message is empty");
    }

    if (!response.source || response.source.trim().length === 0) {
      errors.push("Response source is not specified");
    }

    // Status-specific validation
    switch (response.status) {
      case "success":
        if (!response.data) {
          warnings.push("Success response lacks data payload");
        }
        break;
      case "error":
        if (!response.message.toLowerCase().includes("error")) {
          warnings.push("Error response message doesn't contain 'error'");
        }
        break;
      case "processing":
        if (response.data && Object.keys(response.data).length === 0) {
          warnings.push("Processing response has empty data object");
        }
        break;
    }

    // Source-specific validation
    if (response.source === "rag-service" && response.data) {
      if (!response.data.documents && !response.data.query) {
        warnings.push("RAG response missing expected documents or query data");
      }
    }

    if (response.source === "deepseek-reasoner" && response.data) {
      if (!response.data.reasoning && !response.data.answer) {
        warnings.push("DeepSeek response missing reasoning or answer data");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  subscribe(listener: (response: RealTimeResponse) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getRecentResponses(limit: number = 50): RealTimeResponse[] {
    return this.responses.slice(-limit);
  }

  clearResponses(): void {
    this.responses = [];
    console.log("🧹 Real-time responses cleared");
  }
}

export const realTimeResponseService = RealTimeResponseService.getInstance();
