import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";
import { TextAreaField, TechStackSection, AdvancedFeaturesSection, QuickFillButton } from "./";

interface ProjectFormContainerProps {
  onSubmit: (spec: ProjectSpec) => void;
  spec?: ProjectSpec;
  onSpecChange?: (spec: ProjectSpec) => void;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({ 
  onSubmit, 
  spec: externalSpec,
  onSpecChange 
}) => {
  const [internalSpec, setInternalSpec] = React.useState<ProjectSpec>({
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
    advancedPromptDetails: ""
  });

  // Use external spec if provided, otherwise use internal spec
  const spec = externalSpec || internalSpec;
  const setSpec = onSpecChange || setInternalSpec;

  // Update internal spec when external spec changes
  useEffect(() => {
    if (externalSpec) {
      setInternalSpec(externalSpec);
    }
  }, [externalSpec]);
  
  const handleTechStackToggle = (tech: TechStack, type: "frontend" | "backend") => {
    if (type === "frontend") {
      setSpec({
        ...spec,
        frontendTechStack: spec.frontendTechStack.includes(tech)
          ? spec.frontendTechStack.filter((t) => t !== tech)
          : [...spec.frontendTechStack, tech],
      });
    } else {
      setSpec({
        ...spec,
        backendTechStack: spec.backendTechStack.includes(tech)
          ? spec.backendTechStack.filter((t) => t !== tech)
          : [...spec.backendTechStack, tech],
      });
    }
  };

  const handleAddCustomTech = (tech: string, type: "frontend" | "backend") => {
    if (type === "frontend" && !spec.customFrontendTech.includes(tech)) {
      setSpec({
        ...spec,
        customFrontendTech: [...spec.customFrontendTech, tech],
        frontendTechStack: !spec.frontendTechStack.includes(tech as TechStack) 
          ? [...spec.frontendTechStack, tech as TechStack]
          : spec.frontendTechStack
      });
    } else if (type === "backend" && !spec.customBackendTech.includes(tech)) {
      setSpec({
        ...spec,
        customBackendTech: [...spec.customBackendTech, tech],
        backendTechStack: !spec.backendTechStack.includes(tech as TechStack)
          ? [...spec.backendTechStack, tech as TechStack]
          : spec.backendTechStack
      });
    }
  };

  const handleRemoveCustomTech = (tech: string, type: "frontend" | "backend") => {
    if (type === "frontend") {
      setSpec({
        ...spec,
        customFrontendTech: spec.customFrontendTech.filter(t => t !== tech),
        frontendTechStack: spec.frontendTechStack.filter(t => t !== tech)
      });
    } else {
      setSpec({
        ...spec,
        customBackendTech: spec.customBackendTech.filter(t => t !== tech),
        backendTechStack: spec.backendTechStack.filter(t => t !== tech)
      });
    }
  };

  const handleVectorDbChange = (value: string) => {
    setSpec({
      ...spec,
      ragVectorDb: value as VectorDatabaseType
    });
  };

  const handleMcpTypeChange = (value: string) => {
    setSpec({
      ...spec,
      mcpType: value as MCPType
    });
  };

  const handleSaveCustomVectorDb = (customValue: string) => {
    if (customValue.trim()) {
      setSpec({
        ...spec,
        ragVectorDb: customValue as VectorDatabaseType,
        customRagVectorDb: customValue
      });
    }
  };

  const handleSaveCustomMcp = (customValue: string) => {
    if (customValue.trim()) {
      setSpec({
        ...spec,
        mcpType: customValue as MCPType,
        customMcpType: customValue
      });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setSpec({ ...spec, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(spec);
  };

  const handleQuickFill = (quickFillSpec: ProjectSpec) => {
    setSpec(quickFillSpec);
  };

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
            placeholder="Describe your project in detail..."
            value={spec.projectDescription}
            onChange={(value) => setSpec({ ...spec, projectDescription: value })}
            required={true}
            minHeight="100px"
          />

          <TechStackSection
            frontendTechStack={spec.frontendTechStack}
            backendTechStack={spec.backendTechStack}
            customFrontendTech={spec.customFrontendTech}
            customBackendTech={spec.customBackendTech}
            onTechStackToggle={handleTechStackToggle}
            onAddCustomTech={handleAddCustomTech}
            onRemoveCustomTech={handleRemoveCustomTech}
          />

          <AdvancedFeaturesSection
            ragVectorDb={spec.ragVectorDb}
            customRagVectorDb={spec.customRagVectorDb}
            mcpType={spec.mcpType}
            customMcpType={spec.customMcpType}
            a2aIntegrationDetails={spec.a2aIntegrationDetails}
            advancedPromptDetails={spec.advancedPromptDetails}
            additionalFeatures={spec.additionalFeatures}
            onVectorDbChange={handleVectorDbChange}
            onMcpTypeChange={handleMcpTypeChange}
            onSaveCustomVectorDb={handleSaveCustomVectorDb}
            onSaveCustomMcp={handleSaveCustomMcp}
            onFieldChange={handleFieldChange}
          />

          <Button type="submit" className="w-full bg-gradient-blue-purple hover:opacity-90">
            Generate Cursor Prompt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectFormContainer;
