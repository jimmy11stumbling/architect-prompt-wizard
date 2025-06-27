
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
import QuickCopyBar from "@/components/templates/QuickCopyBar";
import TemplateApplicator from "@/components/templates/TemplateApplicator";
import PlatformSelector from "@/components/platform/PlatformSelector";
import PlatformTemplates from "@/components/platform/PlatformTemplates";
import { ProjectSpec, PlatformType, PlatformConfig } from "@/types/ipa-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProjectGeneration } from "@/hooks/useProjectGeneration";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("cursor");
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    supportedFeatures: [],
    preferredTechStack: ["React", "TypeScript"],
    deploymentOptions: ["Vercel", "Netlify"],
    limitations: [],
    bestPractices: [],
    promptStyle: "conversational",
    contextPreferences: [],
    outputFormat: "detailed"
  });
  const projectFormRef = useRef<ProjectSpecFormHandle>(null);
  const { toast } = useToast();
  const { generationStatus, isGenerating, handleSubmit, handleStreamingSubmit } = useProjectGeneration();

  const handlePlatformChange = (platform: PlatformType, config: PlatformConfig) => {
    setSelectedPlatform(platform);
    setPlatformConfig(config);
    
    // Update the form with platform-specific defaults if needed
    if (projectFormRef.current) {
      const currentSpec = projectFormRef.current.getSpec();
      const updatedSpec: ProjectSpec = {
        ...currentSpec,
        targetPlatform: platform,
        platformSpecificConfig: config
      };
      projectFormRef.current.setSpec(updatedSpec);
    }
    
    toast({
      title: "Platform Selected",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} platform configuration applied`,
    });
  };

  const handleSelectTemplate = (spec: ProjectSpec) => {
    console.log("Index: Applying template from header", spec);
    
    // Update platform state if template has platform info
    if (spec.targetPlatform) {
      setSelectedPlatform(spec.targetPlatform);
      setPlatformConfig(spec.platformSpecificConfig);
    }
    
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
        platform: spec.targetPlatform,
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
          <div className="space-y-6">
            {/* Platform Selection */}
            <PlatformSelector 
              selectedPlatform={selectedPlatform}
              onPlatformChange={handlePlatformChange}
            />
            
            {/* Platform-Specific Templates */}
            <PlatformTemplates
              selectedPlatform={selectedPlatform}
              onSelectTemplate={handleSelectTemplate}
            />
            
            {/* Quick Copy Bar and Template Applicator */}
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <QuickCopyBar />
              </div>
              <TemplateApplicator onApplyTemplate={handleSelectTemplate} />
            </div>
            
            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <ProjectSpecForm ref={projectFormRef} onSubmit={handleStreamingSubmit} />
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
