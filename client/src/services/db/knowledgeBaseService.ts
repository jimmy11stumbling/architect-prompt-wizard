// Migrated to use localStorage for now, can be enhanced with API later
export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  description?: string;
  category?: string;
  tags: string[];
  source_type: string;
  source_url?: string;
  is_public: boolean;
  status: string;
  priority: number;
  version: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parent_category?: string;
  sort_order: number;
}

class KnowledgeBaseService {
  private getStorageKey(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return `knowledge_base_${user.id || 'anonymous'}`;
  }

  private getCategoriesKey(): string {
    return 'knowledge_base_categories';
  }

  private getEntries(): KnowledgeBaseEntry[] {
    const data = localStorage.getItem(this.getStorageKey());
    return data ? JSON.parse(data) : [];
  }

  private saveEntries(entries: KnowledgeBaseEntry[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(entries));
  }

  private getCategories(): KnowledgeBaseCategory[] {
    const data = localStorage.getItem(this.getCategoriesKey());
    return data ? JSON.parse(data) : this.getDefaultCategories();
  }

  private getDefaultCategories(): KnowledgeBaseCategory[] {
    return [
      {
        id: 'technical',
        name: 'Technical Documentation',
        description: 'Programming, frameworks, and technical guides',
        icon: 'Code',
        sort_order: 1
      },
      {
        id: 'business',
        name: 'Business Knowledge',
        description: 'Business processes, strategies, and domain knowledge',
        icon: 'Briefcase',
        sort_order: 2
      },
      {
        id: 'ai-prompts',
        name: 'AI & Prompts',
        description: 'AI-related knowledge and prompt engineering',
        icon: 'Bot',
        sort_order: 3
      },
      {
        id: 'tutorials',
        name: 'Tutorials & Guides',
        description: 'Step-by-step tutorials and how-to guides',
        icon: 'BookOpen',
        sort_order: 4
      },
      {
        id: 'reference',
        name: 'Reference Materials',
        description: 'Quick reference materials and cheat sheets',
        icon: 'FileText',
        sort_order: 5
      },
      {
        id: 'personal',
        name: 'Personal Notes',
        description: 'Personal knowledge and private notes',
        icon: 'User',
        sort_order: 6
      }
    ];
  }

  async getAllEntries(): Promise<KnowledgeBaseEntry[]> {
    return this.getEntries();
  }

  async getPublicEntries(): Promise<KnowledgeBaseEntry[]> {
    const entries = this.getEntries();
    return entries.filter(entry => entry.is_public && entry.status === 'active');
  }

  async getEntriesByCategory(category: string): Promise<KnowledgeBaseEntry[]> {
    const entries = this.getEntries();
    return entries.filter(entry => entry.category === category && entry.status === 'active');
  }

  async searchEntries(query: string): Promise<KnowledgeBaseEntry[]> {
    const entries = this.getEntries();
    const lowercaseQuery = query.toLowerCase();
    
    return entries.filter(entry => 
      entry.status === 'active' && (
        entry.title.toLowerCase().includes(lowercaseQuery) ||
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.description?.toLowerCase().includes(lowercaseQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  }

  async saveEntry(entry: Omit<KnowledgeBaseEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<KnowledgeBaseEntry> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const entries = this.getEntries();
    
    const newEntry: KnowledgeBaseEntry = {
      ...entry,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id?.toString() || 'anonymous',
    };

    entries.push(newEntry);
    this.saveEntries(entries);
    
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry | null> {
    const entries = this.getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;

    entries[index] = {
      ...entries[index],
      ...updates,
      updated_at: new Date().toISOString(),
      version: entries[index].version + 1,
    };

    this.saveEntries(entries);
    return entries[index];
  }

  async deleteEntry(id: string): Promise<void> {
    const entries = this.getEntries();
    const filtered = entries.filter(entry => entry.id !== id);
    this.saveEntries(filtered);
  }

  async getCategories(): Promise<KnowledgeBaseCategory[]> {
    return this.getCategories();
  }

  async getEntryById(id: string): Promise<KnowledgeBaseEntry | null> {
    const entries = this.getEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  async getEntriesByTags(tags: string[]): Promise<KnowledgeBaseEntry[]> {
    const entries = this.getEntries();
    return entries.filter(entry => 
      entry.status === 'active' &&
      tags.some(tag => entry.tags.includes(tag))
    );
  }

  async archiveEntry(id: string): Promise<KnowledgeBaseEntry | null> {
    return this.updateEntry(id, { status: 'archived' });
  }

  async restoreEntry(id: string): Promise<KnowledgeBaseEntry | null> {
    return this.updateEntry(id, { status: 'active' });
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();