
import { ProjectSpec, GenerationStatus } from "@/types/ipa-types";

export class CacheManager {
  private promptCache = new Map<string, string>();
  private statusCache = new Map<string, GenerationStatus>();
  private readonly CACHE_TTL = 600000; // 10 minutes

  generateCacheKey(spec: ProjectSpec): string {
    return `prompt_${JSON.stringify(spec).slice(0, 100)}`;
  }

  generateStatusCacheKey(taskId: string, progress: number): string {
    return `status_${taskId}_${progress}`;
  }

  getCachedPrompt(key: string): string | null {
    return this.promptCache.get(key) || null;
  }

  setCachedPrompt(key: string, value: string): void {
    this.promptCache.set(key, value);
    setTimeout(() => this.promptCache.delete(key), this.CACHE_TTL);
  }

  getCachedStatus(key: string): GenerationStatus | null {
    return this.statusCache.get(key) || null;
  }

  setCachedStatus(key: string, value: GenerationStatus): void {
    this.statusCache.set(key, value);
    setTimeout(() => this.statusCache.delete(key), 30000); // 30 second cache for status
  }

  clearCache(): void {
    this.promptCache.clear();
    this.statusCache.clear();
  }
}
