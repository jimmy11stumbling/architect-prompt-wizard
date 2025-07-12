
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
