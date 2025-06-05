
import React, { useState, useRef } from "react";
import Header from "@/components/Header";
import ProjectSpecForm from "@/components/ProjectSpecForm";
import AgentWorkflow from "@/components/agent-workflow";
import PromptOutput from "@/components/PromptOutput";
import SavedPrompts from "@/components/SavedPrompts";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { ComponentTester, AgentResponseTester } from "@/components/testing";
import RealTimeResponseMonitor from "@/components/enhanced-features/RealTimeResponseMonitor";
import { ProjectSpec, GenerationStatus, TechStack } from "@/types/ipa-types";
import { ipaService } from "@/services/ipaService";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";

const Index: React.FC = () => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("create");
  const projectFormRef = useRef<{ setSpec: (spec: ProjectSpec) => void }>(null);
  const { toast } = useToast();

  const handleSubmit = async (spec: ProjectSpec) => {
    try {
      // Add real-time response for form submission
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "processing",
        message: "Processing project specification submission",
        data: { 
          projectDescription: spec.projectDescription.substring(0, 100),
          frontendTech: spec.frontendTechStack,
          backendTech: spec.backendTechStack
        }
      });

      // Prepare a complete spec with all tech stacks (standard + custom)
      const completeSpec: ProjectSpec = {
        ...spec,
        frontendTechStack: [
          ...spec.frontendTechStack,
          ...spec.customFrontendTech.filter(tech => !spec.frontendTechStack.includes(tech as TechStack)).map(tech => tech as TechStack)
        ],
        backendTechStack: [
          ...spec.backendTechStack,
          ...spec.customBackendTech.filter(tech => !spec.backendTechStack.includes(tech as TechStack)).map(tech => tech as TechStack)
        ]
      };

      setIsGenerating(true);
      setGenerationStatus(null);
      
      const taskId = await ipaService.generatePrompt(completeSpec);
      console.log("Starting generation with task ID:", taskId);
      
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "success",
        message: "Prompt generation started successfully",
        data: { taskId, specValidated: true }
      });
      
      startPolling(taskId);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setIsGenerating(false);
      
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "error",
        message: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start prompt generation",
        variant: "destructive"
      });
    }
  };

  const startPolling = async (taskId: string) => {
    try {
      const status = await ipaService.getGenerationStatus(taskId);
      setGenerationStatus(status);
      
      // Add real-time response for polling updates
      realTimeResponseService.addResponse({
        source: "polling-service",
        status: status.status === "completed" ? "success" : 
                status.status === "failed" ? "error" : "processing",
        message: `Status update: ${status.status} (Progress: ${status.progress})`,
        data: { 
          taskId, 
          status: status.status, 
          progress: status.progress,
          agentCount: status.agents.length
        }
      });
      
      if (status.status !== "completed" && status.status !== "failed") {
        // Continue polling with a 2-second interval
        setTimeout(() => startPolling(taskId), 2000);
      } else {
        // Generation complete or failed
        setIsGenerating(false);
        console.log("Generation completed with status:", status.status);
        
        if (status.status === "completed") {
          realTimeResponseService.addResponse({
            source: "polling-service",
            status: "success",
            message: "Prompt generation completed successfully",
            data: { 
              taskId, 
              finalStatus: status.status,
              resultLength: status.result?.length || 0
            }
          });
          
          toast({
            title: "Generation Complete",
            description: "Your Cursor AI prompt has been successfully generated!",
          });
        }
      }
    } catch (error) {
      console.error("Error polling status:", error);
      setIsGenerating(false);
      
      realTimeResponseService.addResponse({
        source: "polling-service",
        status: "error",
        message: `Polling error: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { taskId, error: error instanceof Error ? error.message : String(error) }
      });
      
      toast({
        title: "Polling Error",
        description: "Failed to check generation status",
        variant: "destructive"
      });
    }
  };

  const handleSelectTemplate = (spec: ProjectSpec) => {
    if (projectFormRef.current) {
      projectFormRef.current.setSpec(spec);
    }
    setActiveTab("create");
    
    realTimeResponseService.addResponse({
      source: "template-selection",
      status: "success",
      message: "Project template applied successfully",
      data: { templateProject: spec.projectDescription.substring(0, 50) }
    });
    
    toast({
      title: "Template Applied",
      description: "Project template has been loaded into the form",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSelectTemplate={handleSelectTemplate} />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              <span className="text-gradient">Intelligent Prompt Architect</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Generate sophisticated Cursor AI prompts for building full-stack applications with Agent-to-Agent communication, RAG 2.0, and MCP integration
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">Create New Prompt</TabsTrigger>
              <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
              <TabsTrigger value="test">Component Tests</TabsTrigger>
              <TabsTrigger value="monitor">Real-time Monitor</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <ProjectSpecForm ref={projectFormRef} onSubmit={handleSubmit} />
                  <ApiKeyForm />
                </div>
                <div className="space-y-8">
                  <AgentWorkflow 
                    agents={generationStatus?.agents || []} 
                    isGenerating={isGenerating}
                  />
                  <PromptOutput prompt={generationStatus?.result} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="saved">
              <SavedPrompts />
            </TabsContent>
            <TabsContent value="test">
              <div className="space-y-8">
                <AgentResponseTester />
                <ComponentTester />
              </div>
            </TabsContent>
            <TabsContent value="monitor">
              <RealTimeResponseMonitor />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          Intelligent Prompt Architect (IPA) - Powered by DeepSeek models with advanced RAG 2.0 and MCP integration
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Index;
