
import React, { useState, useRef } from "react";
import ProjectSpecForm, { ProjectSpecFormHandle } from "@/components/ProjectSpecForm";
import AgentWorkflow from "@/components/agent-workflow";
import PromptOutput from "@/components/PromptOutput";
import SavedPrompts from "@/components/SavedPrompts";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { ComponentTester, AgentResponseTester } from "@/components/testing";
import RealTimeResponseMonitor from "@/components/enhanced-features/RealTimeResponseMonitor";
import MainLayout from "@/components/layout/MainLayout";
import ProjectHeader from "@/components/project/ProjectHeader";
import { ProjectSpec } from "@/types/ipa-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProjectGeneration } from "@/hooks/useProjectGeneration";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const projectFormRef = useRef<ProjectSpecFormHandle>(null);
  const { toast } = useToast();
  const { generationStatus, isGenerating, handleSubmit } = useProjectGeneration();

  const handleSelectTemplate = (spec: ProjectSpec) => {
    console.log("Index: Applying template from header", spec);
    if (projectFormRef.current) {
      projectFormRef.current.setSpec(spec);
    }
    setActiveTab("create");
    
    realTimeResponseService.addResponse({
      source: "template-selection",
      status: "success",
      message: "Comprehensive project template applied successfully",
      data: { 
        templateProject: spec.projectDescription.substring(0, 50),
        techStack: [...spec.frontendTechStack, ...spec.backendTechStack],
        hasRAG: spec.ragVectorDb !== "None",
        hasMCP: spec.mcpType !== "None",
        hasA2A: spec.a2aIntegrationDetails.length > 0
      }
    });
    
    toast({
      title: "Template Applied Successfully",
      description: "Comprehensive project template has been loaded into the form with all features",
    });
  };

  return (
    <MainLayout onSelectTemplate={handleSelectTemplate}>
      <ProjectHeader />

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
    </MainLayout>
  );
};

export default Index;
