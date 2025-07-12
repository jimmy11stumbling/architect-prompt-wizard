
import { useState, useEffect } from "react";
import { SavedPrompt, PromptCategory, PromptStats, promptService } from "@/services/api/promptService";
import { useToast } from "@/hooks/use-toast";

export const usePromptLibrary = (prompts: SavedPrompt[]) => {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [featuredPrompts, setFeaturedPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, statsData, featuredData] = await Promise.all([
        promptService.getCategories(),
        promptService.getStats(),
        promptService.getFeaturedPrompts()
      ]);
      
      setCategories(categoriesData);
      setStats(statsData);
      setFeaturedPrompts(featuredData);
    } catch (error) {
      console.error("Failed to load library data:", error);
      toast({
        title: "Error",
        description: "Failed to load prompt library data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleExport = async () => {
    try {
      const exportData = await promptService.exportPrompts();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-library-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your prompt library has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export prompt library",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedCount = await promptService.importPrompts(text);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${importedCount} prompts`,
      });
      
      await loadLibraryData();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import prompt library",
        variant: "destructive",
      });
    }
  };

  return {
    categories,
    stats,
    featuredPrompts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    isLoading,
    filteredPrompts,
    loadLibraryData,
    handleExport,
    handleImport
  };
};
import { useState, useMemo, useCallback, useEffect } from 'react';
import { SavedPrompt, promptService, PromptStats } from '@/services/api/promptService';

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export const usePromptLibrary = (prompts: SavedPrompt[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate categories from existing prompts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { count: number; tags: string[] }>();
    
    // Initialize default categories
    const defaultCategories = [
      { id: 'development', name: 'Development', icon: '💻', description: 'Code and development prompts' },
      { id: 'design', name: 'Design', icon: '🎨', description: 'UI/UX and design prompts' },
      { id: 'business', name: 'Business', icon: '💼', description: 'Business and strategy prompts' },
      { id: 'writing', name: 'Writing', icon: '✍️', description: 'Content and writing prompts' },
      { id: 'analysis', name: 'Analysis', icon: '📊', description: 'Data analysis and research prompts' },
      { id: 'other', name: 'Other', icon: '📁', description: 'Miscellaneous prompts' }
    ];
    
    // Count prompts in each category
    prompts.forEach(prompt => {
      if (prompt.tags && prompt.tags.length > 0) {
        prompt.tags.forEach(tag => {
          const categoryId = tag.toLowerCase().replace(/\s+/g, '-');
          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, { count: 0, tags: [] });
          }
          const category = categoryMap.get(categoryId)!;
          category.count++;
          if (!category.tags.includes(tag)) {
            category.tags.push(tag);
          }
        });
      } else {
        // Uncategorized prompts go to 'other'
        const otherCategory = categoryMap.get('other') || { count: 0, tags: [] };
        otherCategory.count++;
        categoryMap.set('other', otherCategory);
      }
    });

    // Build final categories array
    const finalCategories: PromptCategory[] = [];
    
    defaultCategories.forEach(defaultCat => {
      const data = categoryMap.get(defaultCat.id) || { count: 0, tags: [] };
      if (data.count > 0) {
        finalCategories.push({
          ...defaultCat,
          count: data.count
        });
      }
    });

    // Add dynamic categories from tags
    categoryMap.forEach((data, categoryId) => {
      if (!defaultCategories.find(cat => cat.id === categoryId) && data.count > 0) {
        const displayName = data.tags[0] || categoryId.replace(/-/g, ' ');
        finalCategories.push({
          id: categoryId,
          name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
          icon: '🏷️',
          description: `${data.count} prompts with ${displayName} tag`,
          count: data.count
        });
      }
    });

    return finalCategories.filter(cat => cat.count > 0);
  }, [prompts]);

  // Featured prompts (high rating or usage)
  const featuredPrompts = useMemo(() => {
    return prompts
      .filter(prompt => 
        (prompt.rating && prompt.rating >= 4) || 
        (prompt.usage && prompt.usage >= 5)
      )
      .sort((a, b) => {
        const scoreA = (a.rating || 0) + (a.usage || 0) * 0.1;
        const scoreB = (b.rating || 0) + (b.usage || 0) * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, 6);
  }, [prompts]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.projectName?.toLowerCase().includes(search) ||
        prompt.prompt?.toLowerCase().includes(search) ||
        prompt.description?.toLowerCase().includes(search) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(prompt => {
        if (!prompt.tags || prompt.tags.length === 0) {
          return selectedCategory === 'other';
        }
        return prompt.tags.some(tag => 
          tag.toLowerCase().replace(/\s+/g, '-') === selectedCategory
        );
      });
    }

    return filtered;
  }, [prompts, searchTerm, selectedCategory]);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      if (prompts.length === 0) return;
      
      setIsLoading(true);
      try {
        const statsData = await promptService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to calculated stats
        const fallbackStats: PromptStats = {
          totalPrompts: prompts.length,
          publicPrompts: prompts.filter(p => p.isPublic).length,
          categories: categories.length,
          totalUsage: prompts.reduce((sum, p) => sum + (p.usage || 0), 0),
          averageRating: prompts.length > 0 
            ? prompts.reduce((sum, p) => sum + (p.rating || 0), 0) / prompts.length 
            : 0
        };
        setStats(fallbackStats);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [prompts, categories.length]);

  // Export/Import handlers
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [prompts]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        console.log('Imported prompts:', importedData);
        // You would need to implement the actual import logic here
        // This might involve calling a service to save the imported prompts
      } catch (error) {
        console.error('Error importing prompts:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    categories,
    stats,
    featuredPrompts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    isLoading,
    filteredPrompts,
    handleExport,
    handleImport
  };
};
