import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";
import { TextAreaField, TechStackSection, AdvancedFeaturesSection, QuickFillButton, ProjectFormValidation } from "./";

interface ProjectFormContainerProps {
  onSubmit: (spec: ProjectSpec) => void;
  spec?: ProjectSpec;
  onSpecChange?: (spec: ProjectSpec) => void;
}

const defaultSpec: ProjectSpec = {
  projectDescription: "",
  frontendTechStack: ["React"],
  backendTechStack: ["Express"],
  customFrontendTech: [],
  customBackendTech: [],
  a2aIntegrationDetails: "",
  additionalFeatures: "",
  ragVectorDb: "None",
  customRagVectorDb: "",
  mcpType: "None",
  customMcpType: "",
  advancedPromptDetails: "",
  deploymentPreference: "Vercel",
  authenticationMethod: "JWT"
};

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({ 
  onSubmit, 
  spec: externalSpec,
  onSpecChange 
}) => {
  const [internalSpec, setInternalSpec] = useState<ProjectSpec>(defaultSpec);
  
  // Use external spec if provided, otherwise use internal spec
  const currentSpec = externalSpec || internalSpec;
  
  // Update internal spec when external spec changes
  useEffect(() => {
    if (externalSpec) {
      setInternalSpec(externalSpec);
    }
  }, [externalSpec]);

  const updateSpec = (newSpec: ProjectSpec) => {
    setInternalSpec(newSpec);
    if (onSpecChange) {
      onSpecChange(newSpec);
    }
  };

  const handleQuickFill = (templateSpec: ProjectSpec) => {
    console.log("ProjectFormContainer: Applying quick fill template", templateSpec);
    updateSpec(templateSpec);
  };

  const handleTechStackToggle = (tech: TechStack, type: "frontend" | "backend") => {
    if (type === "frontend") {
      updateSpec({
        ...currentSpec,
        frontendTechStack: currentSpec.frontendTechStack.includes(tech)
          ? currentSpec.frontendTechStack.filter((t) => t !== tech)
          : [...currentSpec.frontendTechStack, tech],
      });
    } else {
      updateSpec({
        ...currentSpec,
        backendTechStack: currentSpec.backendTechStack.includes(tech)
          ? currentSpec.backendTechStack.filter((t) => t !== tech)
          : [...currentSpec.backendTechStack, tech],
      });
    }
  };

  const handleAddCustomTech = (tech: string, type: "frontend" | "backend") => {
    if (type === "frontend" && !currentSpec.customFrontendTech.includes(tech)) {
      updateSpec({
        ...currentSpec,
        customFrontendTech: [...currentSpec.customFrontendTech, tech],
        frontendTechStack: !currentSpec.frontendTechStack.includes(tech as TechStack) 
          ? [...currentSpec.frontendTechStack, tech as TechStack]
          : currentSpec.frontendTechStack
      });
    } else if (type === "backend" && !currentSpec.customBackendTech.includes(tech)) {
      updateSpec({
        ...currentSpec,
        customBackendTech: [...currentSpec.customBackendTech, tech],
        backendTechStack: !currentSpec.backendTechStack.includes(tech as TechStack)
          ? [...currentSpec.backendTechStack, tech as TechStack]
          : currentSpec.backendTechStack
      });
    }
  };

  const handleRemoveCustomTech = (tech: string, type: "frontend" | "backend") => {
    if (type === "frontend") {
      updateSpec({
        ...currentSpec,
        customFrontendTech: currentSpec.customFrontendTech.filter(t => t !== tech),
        frontendTechStack: currentSpec.frontendTechStack.filter(t => t !== tech)
      });
    } else {
      updateSpec({
        ...currentSpec,
        customBackendTech: currentSpec.customBackendTech.filter(t => t !== tech),
        backendTechStack: currentSpec.backendTechStack.filter(t => t !== tech)
      });
    }
  };

  const handleVectorDbChange = (value: string) => {
    updateSpec({
      ...currentSpec,
      ragVectorDb: value as VectorDatabaseType
    });
  };

  const handleMcpTypeChange = (value: string) => {
    updateSpec({
      ...currentSpec,
      mcpType: value as MCPType
    });
  };

  const handleSaveCustomVectorDb = (customValue: string) => {
    if (customValue.trim()) {
      updateSpec({
        ...currentSpec,
        ragVectorDb: customValue as VectorDatabaseType,
        customRagVectorDb: customValue
      });
    }
  };

  const handleSaveCustomMcp = (customValue: string) => {
    if (customValue.trim()) {
      updateSpec({
        ...currentSpec,
        mcpType: customValue as MCPType,
        customMcpType: customValue
      });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    updateSpec({ ...currentSpec, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!currentSpec.projectDescription.trim() || currentSpec.frontendTechStack.length === 0 || currentSpec.backendTechStack.length === 0) {
      return; // Don't submit if validation fails
    }
    
    console.log("ProjectFormContainer: Submitting spec", currentSpec);
    onSubmit(currentSpec);
  };

  const isFormValid = currentSpec.projectDescription.trim() && currentSpec.frontendTechStack.length > 0 && currentSpec.backendTechStack.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Specifications</span>
          <QuickFillButton onQuickFill={handleQuickFill} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextAreaField
            label="Project Description"
            placeholder="Describe your project in detail including main features, target audience, key functionalities, and business objectives..."
            value={currentSpec.projectDescription}
            onChange={(value) => updateSpec({ ...currentSpec, projectDescription: value })}
            required={true}
            minHeight="120px"
          />

          <TechStackSection
            frontendTechStack={currentSpec.frontendTechStack}
            backendTechStack={currentSpec.backendTechStack}
            customFrontendTech={currentSpec.customFrontendTech}
            customBackendTech={currentSpec.customBackendTech}
            onTechStackToggle={handleTechStackToggle}
            onAddCustomTech={handleAddCustomTech}
            onRemoveCustomTech={handleRemoveCustomTech}
          />

          <AdvancedFeaturesSection
            ragVectorDb={currentSpec.ragVectorDb}
            customRagVectorDb={currentSpec.customRagVectorDb}
            mcpType={currentSpec.mcpType}
            customMcpType={currentSpec.customMcpType}
            a2aIntegrationDetails={currentSpec.a2aIntegrationDetails}
            advancedPromptDetails={currentSpec.advancedPromptDetails}
            additionalFeatures={currentSpec.additionalFeatures}
            onVectorDbChange={handleVectorDbChange}
            onMcpTypeChange={handleMcpTypeChange}
            onSaveCustomVectorDb={handleSaveCustomVectorDb}
            onSaveCustomMcp={handleSaveCustomMcp}
            onFieldChange={handleFieldChange}
          />

          <ProjectFormValidation spec={currentSpec} />

          <Button 
            type="submit" 
            className="w-full bg-gradient-blue-purple hover:opacity-90"
            disabled={!isFormValid}
          >
            {isFormValid ? "Generate Cursor Prompt" : "Complete Required Fields"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectFormContainer;
