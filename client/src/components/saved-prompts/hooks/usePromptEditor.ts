
import { useState, useEffect } from "react";
import { SavedPrompt, promptService } from "@/services/api/promptService";
import { useToast } from "@/hooks/use-toast";

export const usePromptEditor = (prompt?: SavedPrompt | null, onSave?: () => void, onClose?: () => void) => {
  const [formData, setFormData] = useState<Partial<SavedPrompt>>({
    projectName: "",
    prompt: "",
    description: "",
    tags: [],
    category: "",
    isPublic: false,
    author: "",
    complexity: "beginner",
    techStack: [],
    estimatedTime: ""
  });
  const [newTag, setNewTag] = useState("");
  const [newTech, setNewTech] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (prompt) {
      setFormData({
        ...prompt,
        tags: prompt.tags || [],
        techStack: prompt.techStack || []
      });
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!formData.projectName?.trim() || !formData.prompt?.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name and prompt are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const promptData: SavedPrompt = {
        ...formData,
        projectName: formData.projectName.trim(),
        prompt: formData.prompt.trim(),
        description: formData.description?.trim() || "",
        timestamp: formData.timestamp || Date.now(),
        lastModified: Date.now()
      } as SavedPrompt;

      if (prompt?.id) {
        await promptService.updatePrompt(prompt.id, promptData);
        toast({
          title: "Prompt Updated",
          description: "Your prompt has been updated successfully",
        });
      } else {
        await promptService.savePrompt(promptData);
        toast({
          title: "Prompt Saved",
          description: "Your new prompt has been saved successfully",
        });
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save the prompt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addTech = () => {
    if (newTech.trim() && !formData.techStack?.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTech = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack?.filter(tech => tech !== techToRemove) || []
    }));
  };

  return {
    formData,
    setFormData,
    newTag,
    setNewTag,
    newTech,
    setNewTech,
    isSaving,
    handleSave,
    addTag,
    removeTag,
    addTech,
    removeTech
  };
};
