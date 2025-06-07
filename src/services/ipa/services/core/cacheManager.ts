
import { performanceMonitor } from "../../performanceMonitor";
import { cacheService } from "../../cacheService";
import { GenerationStatus } from "@/types/ipa-types";

export class CacheManager {
  getCachedPrompt(cacheKey: string): string | null {
    return cacheService.get<string>(cacheKey);
  }

  setCachedPrompt(cacheKey: string, taskId: string): void {
    cacheService.set(cacheKey, taskId, 600000); // 10 minute cache
  }

  getCachedStatus(cacheKey: string): GenerationStatus | null {
    return cacheService.get<GenerationStatus>(cacheKey);
  }

  setCachedStatus(cacheKey: string, result: GenerationStatus): void {
    cacheService.set(cacheKey, result, 30000); // 30 second cache for status
  }

  generateCacheKey(data: any): string {
    return `prompt_${JSON.stringify(data).slice(0, 100)}`;
  }

  generateStatusCacheKey(taskId: string, progress: number): string {
    return `status_${taskId}_${progress}`;
  }
}
