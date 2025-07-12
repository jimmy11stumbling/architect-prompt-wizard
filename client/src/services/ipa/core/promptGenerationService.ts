
import { ProjectSpec } from "@/types/ipa-types";
import { mockTaskId } from "../mockData";
import { connectionPool } from "../connectionPool";
import { performanceMonitor } from "../performanceMonitor";
import { SpecValidator } from "../validation/specValidator";
import { CacheManager } from "../services/core/cacheManager";
import { realTimeResponseService } from "../../integration/realTimeResponseService";
import { toast } from "@/hooks/use-toast";

const cacheManager = new CacheManager();

export class PromptGenerationService {
  static async generatePrompt(spec: ProjectSpec): Promise<string> {
    const startTime = performance.now();
    
    try {
      // Add real-time response for generation start
      realTimeResponseService.addResponse({
        source: "prompt-generation-service",
        status: "processing",
        message: "Starting prompt generation with scalable service",
        data: { projectDescription: spec.projectDescription.substring(0, 100) }
      });

      // Validate the spec
      SpecValidator.validate(spec);

      // Check cache first
      const cacheKey = cacheManager.generateCacheKey(spec);
      const cachedResult = cacheManager.getCachedPrompt(cacheKey);
      if (cachedResult) {
        performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, true);
        
        realTimeResponseService.addResponse({
          source: "prompt-generation-service",
          status: "success",
          message: "Prompt generation retrieved from cache",
          data: { cacheHit: true, cacheKey }
        });
        
        return cachedResult;
      }

      // Acquire connection from pool
      const connectionId = await connectionPool.acquireConnection();
      
      try {
        // Cache the task ID
        cacheManager.setCachedPrompt(cacheKey, mockTaskId);
        
        performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, true);
        
        realTimeResponseService.addResponse({
          source: "prompt-generation-service",
          status: "success",
          message: "Prompt generation initialized successfully",
          data: { taskId: mockTaskId, connectionId }
        });
        
        toast({
          title: "Generation Started",
          description: "Starting to generate your Master Blueprint with specialized agents",
        });
        
        return Promise.resolve(mockTaskId);
      } finally {
        connectionPool.releaseConnection(connectionId);
      }
    } catch (error) {
      performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, false);
      console.error("Error starting prompt generation:", error);
      
      realTimeResponseService.addResponse({
        source: "prompt-generation-service",
        status: "error",
        message: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to start prompt generation",
        variant: "destructive"
      });
      throw error;
    }
  }
}
