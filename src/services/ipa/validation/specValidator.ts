
import { ProjectSpec } from "@/types/ipa-types";

export class SpecValidator {
  static validate(spec: ProjectSpec): void {
    if (!spec.projectDescription?.trim()) {
      throw new Error("Project description is required");
    }
    
    if (!spec.frontendTechStack || spec.frontendTechStack.length === 0) {
      throw new Error("At least one frontend technology must be selected");
    }
    
    if (!spec.backendTechStack || spec.backendTechStack.length === 0) {
      throw new Error("At least one backend technology must be selected");
    }
  }
}
