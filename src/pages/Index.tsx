
import React, { useState } from "react";
import Header from "@/components/Header";
import ProjectSpecForm from "@/components/ProjectSpecForm";
import AgentWorkflow from "@/components/agent-workflow";
import PromptOutput from "@/components/PromptOutput";
import SavedPrompts from "@/components/SavedPrompts";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { ComponentTester } from "@/components/testing";
import { ProjectSpec, GenerationStatus, TechStack } from "@/types/ipa-types";
import { ipaService } from "@/services/ipaService";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("create");

  const handleSubmit = async (spec: ProjectSpec) => {
    // Prepare a complete spec with all tech stacks (standard + custom)
    const completeSpec = {
      ...spec,
      frontendTechStack: [
        ...spec.frontendTechStack,
        ...spec.customFrontendTech.filter(tech => !spec.frontendTechStack.includes(tech as TechStack))
      ],
      backendTechStack: [
        ...spec.backendTechStack,
        ...spec.customBackendTech.filter(tech => !spec.backendTechStack.includes(tech as TechStack))
      ]
    };

    setIsGenerating(true);
    try {
      const taskId = await ipaService.generatePrompt(completeSpec);
      console.log("Starting generation with task ID:", taskId);
      startPolling(taskId);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setIsGenerating(false);
    }
  };

  const startPolling = async (taskId: string) => {
    try {
      const status = await ipaService.getGenerationStatus(taskId);
      setGenerationStatus(status);
      
      if (status.status !== "completed" && status.status !== "failed") {
        // Continue polling with a 2-second interval
        setTimeout(() => startPolling(taskId), 2000);
      } else {
        // Generation complete or failed
        setIsGenerating(false);
        console.log("Generation completed with status:", status.status);
      }
    } catch (error) {
      console.error("Error polling status:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              <span className="text-gradient">Intelligent Prompt Architect</span>
            </h1>
            <p className="text-lg text-ipa-muted max-w-3xl mx-auto">
              Generate sophisticated Cursor AI prompts for building full-stack applications with Agent-to-Agent communication
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create New Prompt</TabsTrigger>
              <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
              <TabsTrigger value="test">Component Tests</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <ProjectSpecForm onSubmit={handleSubmit} />
                  <ApiKeyForm />
                </div>
                <div className="space-y-8">
                  <AgentWorkflow agents={generationStatus?.agents || []} />
                  <PromptOutput prompt={generationStatus?.result} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="saved">
              <SavedPrompts />
            </TabsContent>
            <TabsContent value="test">
              <ComponentTester />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t border-ipa-border py-4">
        <div className="container text-center text-sm text-ipa-muted">
          Intelligent Prompt Architect (IPA) - Powered by DeepSeek models
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Index;
