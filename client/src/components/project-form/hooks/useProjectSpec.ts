
import { useState, useEffect, useCallback } from "react";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";

const defaultSpec: ProjectSpec = {
  targetPlatform: "cursor",
  platformSpecificConfig: {
    supportedFeatures: [],
    preferredTechStack: ["React", "TypeScript"],
    deploymentOptions: ["Vercel", "Netlify"],
    limitations: [],
    bestPractices: [],
    promptStyle: "conversational",
    contextPreferences: [],
    outputFormat: "detailed"
  },
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

interface UseProjectSpecProps {
  externalSpec?: ProjectSpec;
  onSpecChange?: (spec: ProjectSpec) => void;
}

export const useProjectSpec = ({ externalSpec, onSpecChange }: UseProjectSpecProps) => {
  const [internalSpec, setInternalSpec] = useState<ProjectSpec>(defaultSpec);
  
  // Always prioritize external spec if available
  const currentSpec = externalSpec || internalSpec;
  
  // Update internal spec when external spec changes
  useEffect(() => {
    if (externalSpec) {
      console.log("useProjectSpec: Updating internal spec from external", externalSpec);
      setInternalSpec(externalSpec);
    }
  }, [externalSpec]);

  const updateSpec = useCallback((newSpec: ProjectSpec) => {
    console.log("useProjectSpec: updateSpec called with", newSpec);
    
    setInternalSpec(newSpec);
    
    // Always call onSpecChange to update parent state
    if (onSpecChange) {
      console.log("useProjectSpec: calling onSpecChange");
      onSpecChange(newSpec);
    }
  }, [onSpecChange]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    updateSpec({ ...currentSpec, [field]: value });
  }, [currentSpec, updateSpec]);

  const handleTechStackToggle = useCallback((tech: TechStack, type: "frontend" | "backend") => {
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
  }, [currentSpec, updateSpec]);

  const handleAddCustomTech = useCallback((tech: string, type: "frontend" | "backend") => {
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
  }, [currentSpec, updateSpec]);

  const handleRemoveCustomTech = useCallback((tech: string, type: "frontend" | "backend") => {
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
  }, [currentSpec, updateSpec]);

  const handleVectorDbChange = useCallback((value: string) => {
    updateSpec({
      ...currentSpec,
      ragVectorDb: value as VectorDatabaseType
    });
  }, [currentSpec, updateSpec]);

  const handleMcpTypeChange = useCallback((value: string) => {
    updateSpec({
      ...currentSpec,
      mcpType: value as MCPType
    });
  }, [currentSpec, updateSpec]);

  const handleSaveCustomVectorDb = useCallback((customValue: string) => {
    if (customValue.trim()) {
      updateSpec({
        ...currentSpec,
        ragVectorDb: customValue as VectorDatabaseType,
        customRagVectorDb: customValue
      });
    }
  }, [currentSpec, updateSpec]);

  const handleSaveCustomMcp = useCallback((customValue: string) => {
    if (customValue.trim()) {
      updateSpec({
        ...currentSpec,
        mcpType: customValue as MCPType,
        customMcpType: customValue
      });
    }
  }, [currentSpec, updateSpec]);

  const isFormValid = currentSpec.projectDescription.trim() && 
                     currentSpec.frontendTechStack.length > 0 && 
                     currentSpec.backendTechStack.length > 0;

  return {
    currentSpec,
    updateSpec,
    handleFieldChange,
    handleTechStackToggle,
    handleAddCustomTech,
    handleRemoveCustomTech,
    handleVectorDbChange,
    handleMcpTypeChange,
    handleSaveCustomVectorDb,
    handleSaveCustomMcp,
    isFormValid
  };
};
