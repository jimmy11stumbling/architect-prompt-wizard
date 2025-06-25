
import { GenerationStatus } from "@/types/ipa-types";
import { performanceMonitor } from "../performanceMonitor";
import { requestBatcher } from "../requestBatcher";
import { StatusManager } from "../status/statusManager";
import { GenerationManager } from "./generationManager";
import { CacheManager } from "./cacheManager";
import { realTimeResponseService } from "../../integration/realTimeResponseService";

export class StatusService {
  private statusManager: StatusManager;
  private generationManager: GenerationManager;
  private cacheManager: CacheManager;
  private currentProjectSpec: any = null;

  constructor() {
    this.statusManager = new StatusManager();
    this.generationManager = new GenerationManager(this.statusManager);
    this.cacheManager = new CacheManager();
  }

  setProjectSpec(spec: any): void {
    this.currentProjectSpec = spec;
    this.statusManager.initializeStatus(spec);
  }

  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    const startTime = performance.now();
    
    return new Promise(async (resolve) => {
      try {
        // Add real-time response for status check
        realTimeResponseService.addResponse({
          source: "status-service",
          status: "processing",
          message: "Checking generation status",
          data: { taskId }
        });

        // Check cache first
        const currentStatus = this.statusManager.getCurrentStatus();
        const cacheKey = this.cacheManager.generateStatusCacheKey(taskId, currentStatus.progress);
        const cachedStatus = this.cacheManager.getCachedStatus(cacheKey);
        if (cachedStatus) {
          performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
          resolve(cachedStatus);
          return;
        }

        // Use request batching for high load scenarios
        const batchKey = `status_batch_${Math.floor(Date.now() / 1000)}`; // 1-second batches
        
        const result = await requestBatcher.addRequest(batchKey, async () => {
          return await this.processStatusUpdate();
        });

        // Cache the result
        this.cacheManager.setCachedStatus(cacheKey, result);
        
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
        resolve(result);
      } catch (error) {
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, false);
        console.error("Error in getGenerationStatus:", error);
        this.statusManager.setError(error instanceof Error ? error.message : String(error));
        resolve(this.statusManager.getCurrentStatus());
      }
    });
  }

  private async processStatusUpdate(): Promise<GenerationStatus> {
    // Simulate slight network delay
    await new Promise(r => setTimeout(r, 100));
    
    const currentStatus = this.statusManager.getCurrentStatus();
    const currentStep = Math.min(currentStatus.progress + 1, 7 + 1); // 7 agents + final step
    
    // If we're processing a new agent, invoke DeepSeek API for that agent
    if (currentStep > 0 && currentStep <= 7 && this.currentProjectSpec) {
      await this.generationManager.processAgent(currentStep, this.currentProjectSpec);
    }
    
    // Update progress
    this.statusManager.updateProgress(currentStep);
    
    // If we've completed all agents, generate the final result
    const updatedStatus = this.statusManager.getCurrentStatus();
    if (currentStep > 7 && !updatedStatus.result && this.currentProjectSpec) {
      await this.generationManager.generateFinalResult(this.currentProjectSpec);
    }
    
    return this.statusManager.getCurrentStatus();
  }
}
