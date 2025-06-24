

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PromptRow = Database['public']['Tables']['prompts']['Row'];
type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

export interface SavedPrompt {
  id?: string;
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

class SupabasePromptService {
  private convertFromDb(row: PromptRow): SavedPrompt {
    return {
      id: row.id,
      projectName: row.project_name,
      prompt: row.prompt,
      description: row.description || undefined,
      tags: row.tags || [],
      category: row.category || undefined,
      isPublic: row.is_public || false,
      author: row.author || undefined,
      usage: row.usage_count || 0,
      rating: row.rating ? Number(row.rating) : 0,
      complexity: (row.complexity as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      techStack: row.tech_stack || [],
      estimatedTime: row.estimated_time || undefined,
      timestamp: new Date(row.created_at).getTime(),
      lastModified: new Date(row.updated_at).getTime()
    };
  }

  private convertToDb(prompt: Partial<SavedPrompt>): Partial<PromptInsert> {
    return {
      project_name: prompt.projectName,
      prompt: prompt.prompt,
      description: prompt.description,
      tags: prompt.tags,
      category: prompt.category,
      is_public: prompt.isPublic,
      author: prompt.author,
      usage_count: prompt.usage,
      rating: prompt.rating,
      complexity: prompt.complexity,
      tech_stack: prompt.techStack,
      estimated_time: prompt.estimatedTime
    };
  }

  async savePrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to save prompts');
    }

    const insertData: PromptInsert = {
      ...this.convertToDb(prompt),
      user_id: user.data.user.id
    } as PromptInsert;

    const { data, error } = await supabase
      .from('prompts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.convertFromDb(data);
  }

  async getAllPrompts(): Promise<SavedPrompt[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getPromptsByCategory(categoryId: string): Promise<SavedPrompt[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('category', categoryId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getPublicPrompts(): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getFeaturedPrompts(): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .gte('rating', 4)
      .order('usage_count', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async searchPrompts(query: string): Promise<SavedPrompt[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.data.user.id)
      .or(`project_name.ilike.%${query}%,prompt.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updatePrompt(id: string, updates: Partial<SavedPrompt>): Promise<SavedPrompt | null> {
    const updateData: PromptUpdate = this.convertToDb(updates) as PromptUpdate;

    const { data, error } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? this.convertFromDb(data) : null;
  }

  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_prompt_usage', { 
      prompt_id: id 
    });
    if (error) throw error;
  }

  async ratePrompt(id: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { error } = await supabase
      .from('prompts')
      .update({ rating })
      .eq('id', id);

    if (error) throw error;
  }

  async getPromptById(id: string): Promise<SavedPrompt | null> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.convertFromDb(data);
  }

  async getCategories(): Promise<PromptCategory[]> {
    const { data, error } = await supabase
      .from('prompt_categories')
      .select('*');

    if (error) throw error;

    // Get count for each category
    const categoriesWithCount = await Promise.all(
      data.map(async (category) => {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          return { ...category, count: 0 };
        }

        const { count } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.data.user.id)
          .eq('category', category.id);

        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          icon: category.icon || '',
          count: count || 0
        };
      })
    );

    return categoriesWithCount;
  }

  async getStats(): Promise<PromptStats> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return {
        totalPrompts: 0,
        publicPrompts: 0,
        categories: 0,
        totalUsage: 0,
        averageRating: 0
      };
    }

    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('is_public, usage_count, rating')
      .eq('user_id', user.data.user.id);

    if (error) throw error;

    const totalPrompts = prompts.length;
    const publicPrompts = prompts.filter(p => p.is_public).length;
    const totalUsage = prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0);
    const ratingsSum = prompts.reduce((sum, p) => sum + (Number(p.rating) || 0), 0);
    const ratedPrompts = prompts.filter(p => p.rating && Number(p.rating) > 0).length;

    const { data: categories } = await supabase
      .from('prompt_categories')
      .select('id');

    return {
      totalPrompts,
      publicPrompts,
      categories: categories?.length || 0,
      totalUsage,
      averageRating: ratedPrompts > 0 ? ratingsSum / ratedPrompts : 0
    };
  }

  async exportPrompts(): Promise<string> {
    const prompts = await this.getAllPrompts();
    const categories = await this.getCategories();
    
    const exportData = {
      prompts,
      categories,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importPrompts(jsonData: string): Promise<number> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to import prompts');
    }

    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;
      
      if (data.prompts && Array.isArray(data.prompts)) {
        const insertData = data.prompts.map((prompt: SavedPrompt) => ({
          ...this.convertToDb(prompt),
          user_id: user.data.user.id
        })) as PromptInsert[];

        const { error } = await supabase
          .from('prompts')
          .insert(insertData);

        if (error) throw error;
        importedCount = insertData.length;
      }
      
      return importedCount;
    } catch (error) {
      throw new Error('Invalid import data format');
    }
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
