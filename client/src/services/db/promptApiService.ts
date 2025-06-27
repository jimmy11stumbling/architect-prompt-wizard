import { InsertSavedPrompt, SavedPrompt } from "@shared/schema";

interface SavePromptData {
  projectName: string;
  prompt: string;
  timestamp: number;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  author?: string;
  description?: string;
}

class PromptApiService {
  async savePrompt(data: SavePromptData): Promise<SavedPrompt> {
    // For now, save without userId (will be handled later with auth)
    const promptData: InsertSavedPrompt = {
      title: data.projectName,
      prompt: data.prompt,
      description: data.description,
      tags: data.tags,
      isPublic: data.isPublic ?? false,
      userId: null, // Will be set when auth is implemented
    };

    const response = await fetch("/api/saved-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promptData),
    });

    if (!response.ok) {
      throw new Error("Failed to save prompt to database");
    }

    return response.json();
  }

  async getUserPrompts(userId: number): Promise<SavedPrompt[]> {
    const response = await fetch(`/api/users/${userId}/saved-prompts`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch user prompts");
    }

    return response.json();
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch("/api/saved-prompts/public");
    
    if (!response.ok) {
      throw new Error("Failed to fetch public prompts");
    }

    return response.json();
  }
}

export const promptApiService = new PromptApiService();
export const savePrompt = promptApiService.savePrompt.bind(promptApiService);