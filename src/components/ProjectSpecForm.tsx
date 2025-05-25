
import React, { forwardRef, useImperativeHandle } from "react";
import { ProjectSpec } from "@/types/ipa-types";
import { ProjectFormContainer } from "./project-form";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

export interface ProjectSpecFormRef {
  setSpec: (spec: ProjectSpec) => void;
}

const ProjectSpecForm = forwardRef<ProjectSpecFormRef, ProjectSpecFormProps>(
  ({ onSubmit }, ref) => {
    const [spec, setSpec] = React.useState<ProjectSpec>({
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

    useImperativeHandle(ref, () => ({
      setSpec: (newSpec: ProjectSpec) => {
        setSpec(newSpec);
      }
    }));

    return (
      <ProjectFormContainer 
        onSubmit={onSubmit} 
        spec={spec} 
        onSpecChange={setSpec} 
      />
    );
  }
);

ProjectSpecForm.displayName = "ProjectSpecForm";

export default ProjectSpecForm;
