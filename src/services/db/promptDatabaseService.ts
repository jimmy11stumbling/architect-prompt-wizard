
export interface SavedPrompt {
  id?: number;
  projectName: string;
  prompt: string;
  timestamp: number;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  author?: string;
  description?: string;
  usage?: number;
  rating?: number;
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  techStack?: string[];
  estimatedTime?: string;
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

class PromptDatabaseService {
  private prompts: SavedPrompt[] = [];
  private nextId = 1;
  private categories: PromptCategory[] = [
    {
      id: 'web-apps',
      name: 'Web Applications',
      description: 'Full-stack web application prompts',
      icon: '🌐',
      count: 0
    },
    {
      id: 'mobile-apps',
      name: 'Mobile Apps',
      description: 'Mobile application development prompts',
      icon: '📱',
      count: 0
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      description: 'AI/ML integration and implementation prompts',
      icon: '🤖',
      count: 0
    },
    {
      id: 'data-analytics',
      name: 'Data Analytics',
      description: 'Data processing and analytics prompts',
      icon: '📊',
      count: 0
    },
    {
      id: 'automation',
      name: 'Automation',
      description: 'Workflow and process automation prompts',
      icon: '⚡',
      count: 0
    },
    {
      id: 'creative',
      name: 'Creative Projects',
      description: 'Creative and artistic project prompts',
      icon: '🎨',
      count: 0
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('savedPrompts');
      if (stored) {
        const data = JSON.parse(stored);
        this.prompts = data.prompts || [];
        this.nextId = data.nextId || 1;
        this.updateCategoryCounts();
      }
    } catch (error) {
      console.error('Failed to load prompts from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        prompts: this.prompts,
        nextId: this.nextId,
        lastUpdated: Date.now()
      };
      localStorage.setItem('savedPrompts', JSON.stringify(data));
      this.updateCategoryCounts();
    } catch (error) {
      console.error('Failed to save prompts to storage:', error);
    }
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(category => {
      category.count = this.prompts.filter(p => p.category === category.id).length;
    });
  }

  async savePrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
    const savedPrompt = {
      ...prompt,
      id: this.nextId++,
      timestamp: prompt.timestamp || Date.now(),
      lastModified: Date.now(),
      usage: prompt.usage || 0,
      rating: prompt.rating || 0,
      isPublic: prompt.isPublic || false
    };
    this.prompts.push(savedPrompt);
    this.saveToStorage();
    return savedPrompt;
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    return [...this.prompts].sort((a, b) => (b.lastModified || b.timestamp) - (a.lastModified || a.timestamp));
  }

  async getPromptsByCategory(categoryId: string): Promise<SavedPrompt[]> {
    return this.prompts.filter(p => p.category === categoryId);
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    return this.prompts.filter(p => p.isPublic).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async getFeaturedPrompts(): Promise<SavedPrompt[]> {
    return this.prompts
      .filter(p => p.isPublic && (p.rating || 0) >= 4)
      .sort((a, b) => (b.usage || 0) - (a.usage || 0))
      .slice(0, 6);
  }

  async searchPrompts(query: string): Promise<SavedPrompt[]> {
    const term = query.toLowerCase();
    return this.prompts.filter(prompt =>
      prompt.prompt.toLowerCase().includes(term) ||
      prompt.projectName.toLowerCase().includes(term) ||
      prompt.description?.toLowerCase().includes(term) ||
      (prompt.tags || []).some(tag => tag.toLowerCase().includes(term)) ||
      (prompt.techStack || []).some(tech => tech.toLowerCase().includes(term))
    );
  }

  async deletePrompt(id: number): Promise<void> {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.prompts.splice(index, 1);
      this.saveToStorage();
    }
  }

  async updatePrompt(id: number, updates: Partial<SavedPrompt>): Promise<SavedPrompt | null> {
    const prompt = this.prompts.find(p => p.id === id);
    if (prompt) {
      Object.assign(prompt, updates, { lastModified: Date.now() });
      this.saveToStorage();
      return prompt;
    }
    return null;
  }

  async incrementUsage(id: number): Promise<void> {
    const prompt = this.prompts.find(p => p.id === id);
    if (prompt) {
      prompt.usage = (prompt.usage || 0) + 1;
      this.saveToStorage();
    }
  }

  async ratePrompt(id: number, rating: number): Promise<void> {
    const prompt = this.prompts.find(p => p.id === id);
    if (prompt && rating >= 1 && rating <= 5) {
      prompt.rating = rating;
      this.saveToStorage();
    }
  }

  async getPromptById(id: number): Promise<SavedPrompt | null> {
    return this.prompts.find(p => p.id === id) || null;
  }

  async getCategories(): Promise<PromptCategory[]> {
    this.updateCategoryCounts();
    return [...this.categories];
  }

  async getStats(): Promise<PromptStats> {
    const totalPrompts = this.prompts.length;
    const publicPrompts = this.prompts.filter(p => p.isPublic).length;
    const totalUsage = this.prompts.reduce((sum, p) => sum + (p.usage || 0), 0);
    const ratingsSum = this.prompts.reduce((sum, p) => sum + (p.rating || 0), 0);
    const ratedPrompts = this.prompts.filter(p => p.rating && p.rating > 0).length;

    return {
      totalPrompts,
      publicPrompts,
      categories: this.categories.filter(c => c.count > 0).length,
      totalUsage,
      averageRating: ratedPrompts > 0 ? ratingsSum / ratedPrompts : 0
    };
  }

  async exportPrompts(): Promise<string> {
    const exportData = {
      prompts: this.prompts,
      categories: this.categories,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  async importPrompts(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;
      
      if (data.prompts && Array.isArray(data.prompts)) {
        data.prompts.forEach((prompt: SavedPrompt) => {
          const newPrompt = {
            ...prompt,
            id: this.nextId++,
            timestamp: Date.now(),
            lastModified: Date.now()
          };
          this.prompts.push(newPrompt);
          importedCount++;
        });
        this.saveToStorage();
      }
      
      return importedCount;
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
}

const promptDatabaseService = new PromptDatabaseService();

export { promptDatabaseService };
export type { SavedPrompt as default };
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
} = promptDatabaseService;
