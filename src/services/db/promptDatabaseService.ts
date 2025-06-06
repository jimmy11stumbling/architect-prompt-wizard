
import { GenerationStatus } from "@/types/ipa-types";

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  spec: any;
  timestamp: number;
  status: string;
}

export class PromptDatabaseService {
  private static readonly STORAGE_KEY = "ipa_saved_prompts";

  static async savePrompt(status: GenerationStatus, title: string): Promise<string> {
    const promptId = `prompt-${Date.now()}`;
    
    const savedPrompt: SavedPrompt = {
      id: promptId,
      title,
      content: status.result || "",
      spec: status.spec,
      timestamp: Date.now(),
      status: status.status
    };

    const existingPrompts = this.getAllPrompts();
    existingPrompts.push(savedPrompt);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingPrompts));
    
    return promptId;
  }

  static getAllPrompts(): SavedPrompt[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getPrompt(id: string): SavedPrompt | null {
    const prompts = this.getAllPrompts();
    return prompts.find(p => p.id === id) || null;
  }

  static deletePrompt(id: string): boolean {
    const prompts = this.getAllPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}

// Export functions for backward compatibility
export const savePrompt = PromptDatabaseService.savePrompt;
export const getAllPrompts = PromptDatabaseService.getAllPrompts;
export const getPrompt = PromptDatabaseService.getPrompt;
export const deletePrompt = PromptDatabaseService.deletePrompt;
