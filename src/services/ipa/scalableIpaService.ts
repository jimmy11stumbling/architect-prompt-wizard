
import { GenerationStatus, ProjectSpec } from "@/types/ipa-types";
import { MetricsService } from "./metrics/metricsService";
import { IpaServiceInterface } from "./types/serviceTypes";
import { PromptGenerationService } from "./core/promptGenerationService";
import { StatusService } from "./core/statusService";

// Enhanced service with scalability optimizations
const statusService = new StatusService();

export const scalableIpaService: IpaServiceInterface = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    // Store the spec for use by status service
    statusService.setProjectSpec(spec);
    
    return await PromptGenerationService.generatePrompt(spec);
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    return await statusService.getGenerationStatus(taskId);
  },

  // Get system performance metrics
  getSystemMetrics: () => {
    return MetricsService.getSystemMetrics();
  },

  // Health check endpoint
  healthCheck: async (): Promise<{ status: string; metrics: any }> => {
    return MetricsService.healthCheck();
  }
};
