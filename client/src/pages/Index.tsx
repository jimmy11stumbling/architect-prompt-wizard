import React, { useState, useRef, useEffect } from "react";
import ProjectSpecForm, { ProjectSpecFormHandle } from "@/components/ProjectSpecForm";
import AgentWorkflow from "@/components/agent-workflow";
import RAGIntegratedAgentWorkflow from "@/components/enhanced-features/RAGIntegratedAgentWorkflow";
import PromptOutput from "@/components/PromptOutput";
import SavedPrompts from "@/components/SavedPrompts";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { ComponentTester, AgentResponseTester } from "@/components/testing";
import RealTimeResponseMonitor from "@/components/enhanced-features/RealTimeResponseMonitor";
import MainLayout from "@/components/layout/MainLayout";
import ProjectHeader from "@/components/project/ProjectHeader";

import TemplateApplicator from "@/components/templates/TemplateApplicator";
import PlatformSelector from "@/components/platform/PlatformSelector";
import PlatformTemplates from "@/components/platform/PlatformTemplates";
import { ProjectSpec, PlatformType, PlatformConfig } from "@/types/ipa-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
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
  const [currentProjectSpec, setCurrentProjectSpec] = useState<ProjectSpec | undefined>();

  // Initialize and update project spec with selected platform
  useEffect(() => {
    const initialSpec: ProjectSpec = {
      targetPlatform: selectedPlatform,
      platformSpecificConfig: platformConfig,
      projectDescription: currentProjectSpec?.projectDescription || "",
      frontendTechStack: currentProjectSpec?.frontendTechStack || ["React"],
      backendTechStack: currentProjectSpec?.backendTechStack || ["Express"],
      customFrontendTech: currentProjectSpec?.customFrontendTech || [],
      customBackendTech: currentProjectSpec?.customBackendTech || [],
      a2aIntegrationDetails: currentProjectSpec?.a2aIntegrationDetails || "",
      additionalFeatures: currentProjectSpec?.additionalFeatures || "",
      ragVectorDb: currentProjectSpec?.ragVectorDb || "None",
      customRagVectorDb: currentProjectSpec?.customRagVectorDb || "",
      mcpType: currentProjectSpec?.mcpType || "None",
      customMcpType: currentProjectSpec?.customMcpType || "",
      advancedPromptDetails: currentProjectSpec?.advancedPromptDetails || "",
      deploymentPreference: currentProjectSpec?.deploymentPreference || "Vercel",
      authenticationMethod: currentProjectSpec?.authenticationMethod || "JWT"
    };
    setCurrentProjectSpec(initialSpec);

    // Also update the form ref if it exists
    if (projectFormRef.current) {
      projectFormRef.current.setSpec(initialSpec);
    }
  }, [selectedPlatform, platformConfig]);
  const [ragEnhancedAgents, setRagEnhancedAgents] = useState<Record<string, any>>({});
  const projectFormRef = useRef<ProjectSpecFormHandle>(null);
  const agentWorkflowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { generationStatus, isGenerating, handleSubmit, handleStreamingSubmit } = useProjectGeneration();

  const handlePlatformChange = (platform: PlatformType, config: PlatformConfig) => {
    console.log(`Platform changed to: ${platform}`);
    setSelectedPlatform(platform);
    setPlatformConfig(config);

    // Update the form with platform-specific defaults
    if (projectFormRef.current) {
      const currentSpec = projectFormRef.current.getSpec();
      const updatedSpec: ProjectSpec = {
        ...currentSpec,
        targetPlatform: platform,
        platformSpecificConfig: config
      };
      console.log(`Platform selector updating form with platform: ${platform}`);
      projectFormRef.current.setSpec(updatedSpec);
      setCurrentProjectSpec(updatedSpec); // Also update the local state
    }

    toast({
      title: "Platform Selected",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} platform configuration applied`,
    });
  };

  const handleFormSpecChange = (spec: ProjectSpec) => {
    console.log("Index: Form spec changed", spec);

    // Ensure the spec has a valid platform
    const validSpec = {
      ...spec,
      targetPlatform: spec.targetPlatform || selectedPlatform || 'cursor'
    };

    setCurrentProjectSpec(validSpec);

    // Update platform state if form changes platform
    if (validSpec.targetPlatform && validSpec.targetPlatform !== selectedPlatform) {
      console.log(`Platform changed in form from ${selectedPlatform} to ${validSpec.targetPlatform}`);
      setSelectedPlatform(validSpec.targetPlatform);
    }
  };

  const handleRAGAgentUpdate = (agentName: string, ragContext: any) => {
    setRagEnhancedAgents(prev => ({
      ...prev,
      [agentName]: ragContext
    }));

    realTimeResponseService.addResponse({
      source: "rag-integration",
      status: "success",
      message: `Agent ${agentName} enhanced with RAG database context`,
      data: {
        documents: ragContext.relevantDocuments?.length || 0,
        bestPractices: ragContext.bestPractices?.length || 0,
        platformContext: ragContext.platformContext?.length || 0
      }
    });
  };

  const handleGenerateBlueprint = (spec: ProjectSpec) => {
    // Ensure the spec has the correct platform before submission
    const finalSpec = {
      ...spec,
      targetPlatform: spec.targetPlatform || selectedPlatform || 'cursor'
    };

    console.log(`Submitting spec with platform: ${finalSpec.targetPlatform}`);

    // Start the generation process
    handleStreamingSubmit(finalSpec);

    // Scroll to the agent workflow section after a brief delay
    setTimeout(() => {
      if (agentWorkflowRef.current) {
        agentWorkflowRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 300);
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
    setCurrentProjectSpec(spec);
    setActiveTab("create");

    realTimeResponseService.addResponse({
      source: "template-selection",
      status: "success",
      message: "Comprehensive project template applied with RAG integration",
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
      title: "Template Applied with RAG Integration",
      description: "Comprehensive project template loaded with seamless RAG database access",
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

            {/* Template Applicator */}
            <div className="flex justify-end items-center">
              <TemplateApplicator onApplyTemplate={handleSelectTemplate} />
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <ProjectSpecForm 
                  ref={projectFormRef} 
                  onSubmit={handleGenerateBlueprint}
                  onSpecChange={handleFormSpecChange}
                  key={selectedPlatform} // Force re-render when platform changes
                />
                <ApiKeyForm />
              </div>
              <div className="space-y-8" ref={agentWorkflowRef}>
                <RAGIntegratedAgentWorkflow 
                  agents={generationStatus?.agents || []} 
                  isGenerating={isGenerating}
                  projectSpec={currentProjectSpec}
                  onAgentUpdate={handleRAGAgentUpdate}
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