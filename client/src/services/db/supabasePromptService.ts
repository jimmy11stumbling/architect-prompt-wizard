// Migrated to use new API service instead of Supabase
import { promptService, SavedPrompt as APIPrompt } from "@/services/api/promptService";

export interface SavedPrompt {
  id?: string;
  projectName: string;
  prompt: string;
  description?: string;
  tags: string[];
  category?: string;
  isPublic: boolean;
  author?: string;
  usage: number;
  rating: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  estimatedTime?: string;
  timestamp: number;
  lastModified?: number;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface PromptStats {
  totalPrompts: number;
  publicPrompts: number;
  categories: number;
  totalUsage: number;
  averageRating: number;
}

// Convert between API format and legacy format
function convertFromAPI(apiPrompt: APIPrompt): SavedPrompt {
  return {
    id: apiPrompt.id.toString(),
    projectName: apiPrompt.title,
    prompt: apiPrompt.prompt,
    description: apiPrompt.description,
    tags: apiPrompt.tags,
    category: undefined,
    isPublic: apiPrompt.isPublic,
    author: undefined,
    usage: 0,
    rating: 0,
    complexity: 'beginner',
    techStack: [],
    estimatedTime: undefined,
    timestamp: new Date(apiPrompt.createdAt).getTime(),
    lastModified: new Date(apiPrompt.updatedAt).getTime(),
  };
}

function convertToAPI(prompt: Partial<SavedPrompt>): Partial<Omit<APIPrompt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  return {
    title: prompt.projectName,
    prompt: prompt.prompt,
    description: prompt.description,
    tags: prompt.tags || [],
    isPublic: prompt.isPublic || false,
  };
}

class SupabasePromptService {
  async savePrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
    const apiPrompt = await promptService.savePrompt(convertToAPI(prompt));
    return convertFromAPI(apiPrompt);
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    const apiPrompts = await promptService.getAllPrompts();
    return apiPrompts.map(convertFromAPI);
  }

  async getPromptById(id: string): Promise<SavedPrompt | null> {
    try {
      const apiPrompt = await promptService.getPromptById(parseInt(id));
      return convertFromAPI(apiPrompt);
    } catch (error) {
      return null;
    }
  }

  async getPromptsByCategory(category: string): Promise<SavedPrompt[]> {
    const apiPrompts = await promptService.getPromptsByCategory(category);
    return apiPrompts.map(convertFromAPI);
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    const apiPrompts = await promptService.getPublicPrompts();
    return apiPrompts.map(convertFromAPI);
  }

  async getFeaturedPrompts(): Promise<SavedPrompt[]> {
    const apiPrompts = await promptService.getFeaturedPrompts();
    return apiPrompts.map(convertFromAPI);
  }

  async searchPrompts(query: string): Promise<SavedPrompt[]> {
    const apiPrompts = await promptService.searchPrompts(query);
    return apiPrompts.map(convertFromAPI);
  }

  async deletePrompt(id: string): Promise<void> {
    await promptService.deletePrompt(parseInt(id));
  }

  async updatePrompt(id: string, updates: Partial<SavedPrompt>): Promise<SavedPrompt | null> {
    try {
      const apiPrompt = await promptService.updatePrompt(parseInt(id), convertToAPI(updates));
      return convertFromAPI(apiPrompt);
    } catch (error) {
      return null;
    }
  }

  async incrementUsage(id: string): Promise<void> {
    await promptService.incrementUsage(parseInt(id));
  }

  async ratePrompt(id: string, rating: number): Promise<void> {
    await promptService.ratePrompt(parseInt(id), rating);
  }

  async getCategories(): Promise<PromptCategory[]> {
    const categories = await promptService.getCategories();
    return categories.map((cat, index) => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
      description: `${cat} related prompts`,
      icon: '📁',
      count: 0,
    }));
  }

  async getStats(): Promise<PromptStats> {
    const stats = await promptService.getStats();
    return {
      totalPrompts: stats.total,
      publicPrompts: stats.public,
      categories: 6,
      totalUsage: 0,
      averageRating: 0,
    };
  }

  async exportPrompts(): Promise<string> {
    return promptService.exportPrompts();
  }

  async importPrompts(jsonData: string): Promise<number> {
    return promptService.importPrompts(jsonData);
  }
}

export const supabasePromptService = new SupabasePromptService();

// Export all methods for backward compatibility
export const { 
  savePrompt, 
  getAllPrompts, 
  deletePrompt, 
  getPromptById,
  getPromptsByCategory,
  getPublicPrompts,
  getFeaturedPrompts,
  searchPrompts,
  updatePrompt,
  incrementUsage,
  ratePrompt,
  getCategories,
  getStats,
  exportPrompts,
  importPrompts
} = supabasePromptService;