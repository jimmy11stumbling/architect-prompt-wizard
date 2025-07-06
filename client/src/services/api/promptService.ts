import { useAuth } from '@/hooks/useAuth';

export interface SavedPrompt {
  id: number;
  title: string;
  description?: string;
  prompt: string;
  tags: string[];
  isPublic: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

class PromptService {
  private getHeaders(): HeadersInit {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      'Content-Type': 'application/json',
      'X-User-Id': user.id?.toString() || '',
    };
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch('/api/prompts', {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prompts');
    }
    
    return response.json();
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch('/api/prompts/public');
    
    if (!response.ok) {
      throw new Error('Failed to fetch public prompts');
    }
    
    return response.json();
  }

  async getFeaturedPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch('/api/prompts/featured', {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured prompts');
    }
    
    return response.json();
  }

  async searchPrompts(query: string): Promise<SavedPrompt[]> {
    const response = await fetch(`/api/prompts/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search prompts');
    }
    
    return response.json();
  }

  async getPromptById(id: number): Promise<SavedPrompt> {
    const response = await fetch(`/api/prompts/${id}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch prompt');
    }
    
    return response.json();
  }

  async savePrompt(prompt: Omit<SavedPrompt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<SavedPrompt> {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(prompt),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save prompt');
    }
    
    return response.json();
  }

  async updatePrompt(id: number, updates: Partial<SavedPrompt>): Promise<SavedPrompt> {
    const response = await fetch(`/api/prompts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update prompt');
    }
    
    return response.json();
  }

  async deletePrompt(id: number): Promise<void> {
    const response = await fetch(`/api/prompts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete prompt');
    }
  }

  // Legacy methods for backward compatibility
  async getPromptsByCategory(category: string): Promise<SavedPrompt[]> {
    return this.searchPrompts(category);
  }

  async incrementUsage(id: number): Promise<void> {
    // Implementation can be added later if needed
    console.log('incrementUsage called for prompt:', id);
  }

  async ratePrompt(id: number, rating: number): Promise<void> {
    // Implementation can be added later if needed
    console.log('ratePrompt called for prompt:', id, 'rating:', rating);
  }

  async getCategories(): Promise<string[]> {
    // Return static categories for now
    return ['web-apps', 'mobile-apps', 'ai-ml', 'data-analytics', 'automation', 'creative'];
  }

  async getStats(): Promise<{ total: number; public: number; private: number }> {
    const allPrompts = await this.getAllPrompts();
    const publicPrompts = allPrompts.filter(p => p.isPublic);
    
    return {
      total: allPrompts.length,
      public: publicPrompts.length,
      private: allPrompts.length - publicPrompts.length,
    };
  }

  async exportPrompts(): Promise<string> {
    const prompts = await this.getAllPrompts();
    const exportData = {
      prompts,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importPrompts(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;
      
      if (data.prompts && Array.isArray(data.prompts)) {
        for (const prompt of data.prompts) {
          try {
            await this.savePrompt(prompt);
            importedCount++;
          } catch (error) {
            console.error('Failed to import prompt:', error);
          }
        }
      }
      
      return importedCount;
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
}

export const promptService = new PromptService();

// Export all methods for backward compatibility
export const { 
  getAllPrompts, 
  getPublicPrompts,
  getFeaturedPrompts,
  searchPrompts,
  getPromptById,
  savePrompt,
  updatePrompt,
  deletePrompt,
  getPromptsByCategory,
  incrementUsage,
  ratePrompt,
  getCategories,
  getStats,
  exportPrompts,
  importPrompts
} = promptService;