
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ProjectFormContainer } from "@/components/project-form";
import { ProjectSpec } from "@/types/ipa-types";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
  onSpecChange?: (spec: ProjectSpec) => void;
}

export interface ProjectSpecFormHandle {
  setSpec: (spec: ProjectSpec) => void;
  getSpec: () => ProjectSpec;
}

const defaultSpec: ProjectSpec = {
  targetPlatform: "windsurf",
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

const ProjectSpecForm = forwardRef<ProjectSpecFormHandle, ProjectSpecFormProps>(
  ({ onSubmit, onSpecChange }, ref) => {
    const [spec, setSpec] = useState<ProjectSpec>(defaultSpec);

    useImperativeHandle(ref, () => ({
      setSpec: (newSpec: ProjectSpec) => {
        console.log("ProjectSpecForm: Setting spec via ref", newSpec);
        setSpec(newSpec);
        if (onSpecChange) {
          onSpecChange(newSpec);
        }
      },
      getSpec: () => spec
    }));

    const handleSpecChange = (newSpec: ProjectSpec) => {
      console.log("ProjectSpecForm: Spec changed", newSpec);
      setSpec(newSpec);
      if (onSpecChange) {
        onSpecChange(newSpec);
      }
    };

    const handleSubmit = (submittedSpec: ProjectSpec) => {
      console.log("ProjectSpecForm: Submitting spec", submittedSpec);
      onSubmit(submittedSpec);
    };

    return (
      <ProjectFormContainer
        onSubmit={handleSubmit}
        spec={spec}
        onSpecChange={handleSpecChange}
      />
    );
  }
);

ProjectSpecForm.displayName = "ProjectSpecForm";

export default ProjectSpecForm;
