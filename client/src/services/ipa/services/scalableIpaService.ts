
import { GenerationStatus, ProjectSpec } from "@/types/ipa-types";
import { mockTaskId, agentList } from "../mockData";
import { connectionPool } from "../connectionPool";
import { requestBatcher } from "../requestBatcher";
import { performanceMonitor } from "../performanceMonitor";
import { SpecValidator } from "../validation/specValidator";
import { StatusManager } from "../status/statusManager";
import { MetricsService } from "../metrics/metricsService";
import { IpaServiceInterface } from "../types/serviceTypes";
import { realTimeResponseService } from "../../integration/realTimeResponseService";
import { GenerationManager } from "./core/generationManager";
import { CacheManager } from "./core/cacheManager";
import { toast } from "@/hooks/use-toast";

// Enhanced service with scalability optimizations
const statusManager = new StatusManager();
const generationManager = new GenerationManager(statusManager);
const cacheManager = new CacheManager();
let currentProjectSpec: ProjectSpec | null = null;

export const scalableIpaService: IpaServiceInterface = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    const startTime = performance.now();
    
    try {
      // Add real-time response for generation start
      realTimeResponseService.addResponse({
        source: "scalable-ipa-service",
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
          source: "scalable-ipa-service",
          status: "success",
          message: "Prompt generation retrieved from cache",
          data: { cacheHit: true, cacheKey }
        });
        
        return cachedResult;
      }

      // Acquire connection from pool
      const connectionId = await connectionPool.acquireConnection();
      
      try {
        // Store the spec for use by getGenerationStatus
        currentProjectSpec = spec;
        statusManager.initializeStatus(spec);
        
        // Cache the task ID
        cacheManager.setCachedPrompt(cacheKey, mockTaskId);
        
        performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, true);
        
        realTimeResponseService.addResponse({
          source: "scalable-ipa-service",
          status: "success",
          message: "Prompt generation initialized successfully",
          data: { taskId: mockTaskId, connectionId }
        });
        
        toast({
          title: "Generation Started",
          description: "Starting to generate your Cursor AI prompt with specialized agents",
        });
        
        return Promise.resolve(mockTaskId);
      } finally {
        connectionPool.releaseConnection(connectionId);
      }
    } catch (error) {
      performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, false);
      console.error("Error starting prompt generation:", error);
      
      realTimeResponseService.addResponse({
        source: "scalable-ipa-service",
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
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    const startTime = performance.now();
    
    return new Promise(async (resolve) => {
      try {
        // Add real-time response for status check
        realTimeResponseService.addResponse({
          source: "scalable-ipa-service",
          status: "processing",
          message: "Checking generation status",
          data: { taskId }
        });

        // Check cache first
        const currentStatus = statusManager.getCurrentStatus();
        const cacheKey = cacheManager.generateStatusCacheKey(taskId, currentStatus.progress);
        const cachedStatus = cacheManager.getCachedStatus(cacheKey);
        if (cachedStatus) {
          performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
          resolve(cachedStatus);
          return;
        }

        // Use request batching for high load scenarios
        const batchKey = `status_batch_${Math.floor(Date.now() / 1000)}`; // 1-second batches
        
        const result = await requestBatcher.addRequest(batchKey, async () => {
          // Simulate slight network delay
          await new Promise(r => setTimeout(r, 100)); // Reduced delay for better performance
          
          const currentStep = Math.min(currentStatus.progress + 1, agentList.length + 1);
          
          // If we're processing a new agent, invoke DeepSeek API for that agent
          if (currentStep > 0 && currentStep <= agentList.length) {
            await generationManager.processAgent(currentStep, currentProjectSpec!);
          }
          
          // Update progress
          statusManager.updateProgress(currentStep);
          
          // If we've completed all agents, generate the final result
          const updatedStatus = statusManager.getCurrentStatus();
          if (currentStep > agentList.length && !updatedStatus.result) {
            await generationManager.generateFinalResult(currentProjectSpec!);
          }
          
          return statusManager.getCurrentStatus();
        });

        // Cache the result
        cacheManager.setCachedStatus(cacheKey, result);
        
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
        resolve(result);
      } catch (error) {
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, false);
        console.error("Error in getGenerationStatus:", error);
        statusManager.setError(error instanceof Error ? error.message : String(error));
        resolve(statusManager.getCurrentStatus());
      }
    });
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
