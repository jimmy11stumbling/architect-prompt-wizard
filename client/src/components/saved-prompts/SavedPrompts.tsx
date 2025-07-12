
import React, { useEffect, useState } from "react";
import { SavedPrompt } from "@/services/api/promptService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePromptManagement } from "./hooks/usePromptManagement";
import PromptLibrary from "./PromptLibrary";
import PromptEditor from "./PromptEditor";
import PromptManagement from "./components/PromptManagement";

const SavedPrompts: React.FC = () => {
  const {
    prompts,
    filteredPrompts,
    searchTerm,
    setSearchTerm,
    isLoading,
    loadPrompts,
    handleDeletePrompt,
    handlePromptUse
  } = usePromptManagement();

  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [activeTab, setActiveTab] = useState("library");
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard",
    });
  };

  const handleDownload = (prompt: string, filename = "cursor-prompt.md") => {
    const blob = new Blob([prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "The prompt has been downloaded as a markdown file",
    });
  };

  const handlePromptSelect = (prompt: SavedPrompt) => {
    setSelectedPrompt(prompt);
    setActiveTab("editor");
  };

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Prompt Library</TabsTrigger>
          <TabsTrigger value="manage">Manage Prompts</TabsTrigger>
          <TabsTrigger value="editor">Prompt Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <PromptLibrary 
            prompts={prompts}
            onPromptSelect={handlePromptSelect}
            onPromptUse={handlePromptUse}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <PromptManagement
            prompts={filteredPrompts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isLoading={isLoading}
            onDelete={handleDeletePrompt}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onEdit={handlePromptSelect}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <PromptEditor 
            prompt={selectedPrompt}
            onSave={loadPrompts}
            onClose={() => {
              setSelectedPrompt(null);
              setActiveTab("library");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedPrompts;
