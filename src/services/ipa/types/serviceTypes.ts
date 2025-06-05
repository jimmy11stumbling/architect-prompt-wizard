
import { GenerationStatus, ProjectSpec } from "@/types/ipa-types";

export interface IpaServiceInterface {
  generatePrompt(spec: ProjectSpec): Promise<string>;
  getGenerationStatus(taskId: string): Promise<GenerationStatus>;
  getSystemMetrics?(): any;
  healthCheck?(): Promise<{ status: string; metrics: any }>;
}
