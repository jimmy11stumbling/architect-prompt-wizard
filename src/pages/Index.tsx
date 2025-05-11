
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProjectSpecForm from "@/components/ProjectSpecForm";
import AgentWorkflow from "@/components/AgentWorkflow";
import PromptOutput from "@/components/PromptOutput";
import { ProjectSpec, GenerationStatus, TechStack } from "@/types/ipa-types";
import { ipaService } from "@/services/ipaService";
import { Toaster } from "@/components/ui/toaster";

const Index: React.FC = () => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
        setTimeout(() => startPolling(taskId), 2000);
      } else {
        setIsGenerating(false);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ProjectSpecForm onSubmit={handleSubmit} />
            </div>
            <div className="space-y-8">
              <AgentWorkflow agents={generationStatus?.agents || []} />
              <PromptOutput prompt={generationStatus?.result} />
            </div>
          </div>
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
