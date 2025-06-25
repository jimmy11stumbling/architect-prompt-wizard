
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec } from "@/types/ipa-types";
import { TextAreaField, TechStackSection, AdvancedFeaturesSection, QuickFillButton, ProjectFormValidation } from "./";
import { useProjectSpec } from "./hooks/useProjectSpec";

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
  const {
    currentSpec,
    updateSpec,
    handleTechStackToggle,
    handleAddCustomTech,
    handleRemoveCustomTech,
    handleVectorDbChange,
    handleMcpTypeChange,
    handleSaveCustomVectorDb,
    handleSaveCustomMcp,
    isFormValid
  } = useProjectSpec({ externalSpec, onSpecChange });

  const handleQuickFill = (templateSpec: ProjectSpec) => {
    console.log("ProjectFormContainer: Applying quick fill template", templateSpec);
    updateSpec(templateSpec);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!isFormValid) {
      return;
    }
    
    console.log("ProjectFormContainer: Submitting spec", currentSpec);
    onSubmit(currentSpec);
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
            onFieldChange={(field, value) => updateSpec({ ...currentSpec, [field]: value })}
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
