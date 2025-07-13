// Authentication removed - personal app

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
  usage?: number; // Optional usage count
  rating?: number; // Optional rating
  category?: string; // Optional category
}

export interface PromptStats {
  totalPrompts: number;
  publicPrompts: number;
  categories: number;
  totalUsage: number;
  averageRating: number;
}

class PromptService {
  private apiUrl = '/api/prompts'; // Define the API URL
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-User-Id': '1', // Default user ID for personal app
    };
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch(this.apiUrl, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prompts');
    }

    return response.json();
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch(`${this.apiUrl}/public`);

    if (!response.ok) {
      throw new Error('Failed to fetch public prompts');
    }

    return response.json();
  }

  async getFeaturedPrompts(): Promise<SavedPrompt[]> {
    const response = await fetch(`${this.apiUrl}/featured`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured prompts');
    }

    return response.json();
  }

  async searchPrompts(query: string): Promise<SavedPrompt[]> {
    const response = await fetch(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search prompts');
    }

    return response.json();
  }

  async getPromptById(id: number): Promise<SavedPrompt> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prompt');
    }

    return response.json();
  }

  async savePrompt(prompt: Omit<SavedPrompt, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usage' | 'rating' | 'category'>): Promise<SavedPrompt> {
    const response = await fetch(this.apiUrl, {
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
    const response = await fetch(`${this.apiUrl}/${id}`, {
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
    const response = await fetch(`${this.apiUrl}/${id}`, {
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

  async getStats(): Promise<PromptStats> {
    try {
      const response = await fetch(`${this.apiUrl}/stats?userId=1`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Return fallback stats instead of throwing
        console.warn(`Stats API returned ${response.status}, using fallback data`);
        return {
          totalPrompts: 0,
          publicPrompts: 0,
          categories: 0,
          totalUsage: 0,
          averageRating: 0
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return fallback stats on any error
      return {
        totalPrompts: 0,
        publicPrompts: 0,
        categories: 0,
        totalUsage: 0,
        averageRating: 0
      };
    }
  }

  private calculateStatsFromPrompts(prompts: SavedPrompt[]): PromptStats {
    const totalPrompts = prompts.length;
    const publicPrompts = prompts.filter(p => p.isPublic).length;
    const totalUsage = prompts.reduce((sum, p) => sum + (p.usage || 0), 0);
    const ratings = prompts.filter(p => p.rating && p.rating > 0);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, p) => sum + (p.rating || 0), 0) / ratings.length 
      : 0;
    const categories = new Set(prompts.map(p => p.category).filter(Boolean)).size;

    return {
      totalPrompts,
      publicPrompts,
      categories,
      totalUsage,
      averageRating
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