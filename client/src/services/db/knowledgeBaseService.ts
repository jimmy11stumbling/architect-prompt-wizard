
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBaseRow = Database['public']['Tables']['knowledge_base']['Row'];
type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_base']['Insert'];
type KnowledgeBaseUpdate = Database['public']['Tables']['knowledge_base']['Update'];

export interface KnowledgeBaseEntry {
  id?: string;
  title: string;
  content: string;
  description?: string;
  category?: string;
  tags?: string[];
  sourceType?: string;
  sourceUrl?: string;
  isPublic?: boolean;
  status?: string;
  priority?: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentCategory?: string;
  sortOrder?: number;
}

class KnowledgeBaseService {
  private convertFromDb(row: KnowledgeBaseRow): KnowledgeBaseEntry {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      description: row.description || undefined,
      category: row.category || undefined,
      tags: row.tags || [],
      sourceType: row.source_type || undefined,
      sourceUrl: row.source_url || undefined,
      isPublic: row.is_public || false,
      status: row.status || 'active',
      priority: row.priority || 0,
      version: row.version || 1,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined
    };
  }

  private convertToDb(entry: Partial<KnowledgeBaseEntry>): Partial<KnowledgeBaseInsert> {
    return {
      title: entry.title,
      content: entry.content,
      description: entry.description,
      category: entry.category,
      tags: entry.tags,
      source_type: entry.sourceType,
      source_url: entry.sourceUrl,
      is_public: entry.isPublic,
      status: entry.status,
      priority: entry.priority,
      version: entry.version
    };
  }

  async createEntry(entry: KnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to create knowledge base entries');
    }

    const insertData: KnowledgeBaseInsert = {
      ...this.convertToDb(entry),
      user_id: user.data.user.id
    } as KnowledgeBaseInsert;

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.convertFromDb(data);
  }

  async getAllEntries(): Promise<KnowledgeBaseEntry[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async getEntriesByCategory(category: string): Promise<KnowledgeBaseEntry[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('category', category)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async searchEntries(query: string): Promise<KnowledgeBaseEntry[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', user.data.user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this.convertFromDb(row));
  }

  async updateEntry(id: string, updates: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry | null> {
    const updateData: KnowledgeBaseUpdate = this.convertToDb(updates) as KnowledgeBaseUpdate;

    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? this.convertFromDb(data) : null;
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCategories(): Promise<KnowledgeBaseCategory[]> {
    const { data, error } = await supabase
      .from('knowledge_base_categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      icon: row.icon || undefined,
      parentCategory: row.parent_category || undefined,
      sortOrder: row.sort_order || 0
    }));
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
