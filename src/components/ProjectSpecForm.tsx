
import React, { forwardRef, useImperativeHandle } from "react";
import { ProjectFormContainer } from "@/components/project-form";
import { ProjectSpec } from "@/types/ipa-types";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

export interface ProjectSpecFormHandle {
  setSpec: (spec: ProjectSpec) => void;
}

const ProjectSpecForm = forwardRef<ProjectSpecFormHandle, ProjectSpecFormProps>(
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
      advancedPromptDetails: "",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    });

    useImperativeHandle(ref, () => ({
      setSpec: (newSpec: ProjectSpec) => {
        console.log("ProjectSpecForm: Setting spec via ref", newSpec);
        setSpec(newSpec);
      }
    }));

    const handleSpecChange = (newSpec: ProjectSpec) => {
      console.log("ProjectSpecForm: Spec changed", newSpec);
      setSpec(newSpec);
    };

    return (
      <ProjectFormContainer
        onSubmit={onSubmit}
        spec={spec}
        onSpecChange={handleSpecChange}
      />
    );
  }
);

ProjectSpecForm.displayName = "ProjectSpecForm";

export default ProjectSpecForm;
