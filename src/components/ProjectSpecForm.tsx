
import React from "react";
import { ProjectSpec } from "@/types/ipa-types";
import { ProjectFormContainer } from "./project-form";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

const ProjectSpecForm: React.FC<ProjectSpecFormProps> = ({ onSubmit }) => {
  return <ProjectFormContainer onSubmit={onSubmit} />;
};

export default ProjectSpecForm;
