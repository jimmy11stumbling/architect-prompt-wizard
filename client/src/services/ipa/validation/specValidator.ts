
import { ProjectSpec } from "@/types/ipa-types";

export class SpecValidator {
  static validate(spec: ProjectSpec): void {
    const errors: string[] = [];

    // Basic required field validation
    if (!spec.projectDescription || spec.projectDescription.trim().length === 0) {
      errors.push("Project description is required");
    }

    // Reasonable length limits (increased from the previous strict limits)
    if (spec.projectDescription && spec.projectDescription.length > 5000) {
      errors.push("Project description must be less than 5000 characters");
    }

    if (spec.additionalFeatures && spec.additionalFeatures.length > 3000) {
      errors.push("Additional features must be less than 3000 characters");
    }

    if (spec.a2aIntegrationDetails && spec.a2aIntegrationDetails.length > 2000) {
      errors.push("A2A integration details must be less than 2000 characters");
    }

    if (spec.advancedPromptDetails && spec.advancedPromptDetails.length > 2000) {
      errors.push("Advanced prompt details must be less than 2000 characters");
    }

    // Tech stack validation
    if (!spec.frontendTechStack || spec.frontendTechStack.length === 0) {
      errors.push("At least one frontend technology is required");
    }

    if (!spec.backendTechStack || spec.backendTechStack.length === 0) {
      errors.push("At least one backend technology is required");
    }

    // Custom tech validation
    if (spec.customFrontendTech && spec.customFrontendTech.some(tech => tech.trim().length === 0)) {
      errors.push("Custom frontend technologies cannot be empty");
    }

    if (spec.customBackendTech && spec.customBackendTech.some(tech => tech.trim().length === 0)) {
      errors.push("Custom backend technologies cannot be empty");
    }

    if (errors.length > 0) {
      console.error("Spec validation failed:", errors);
      throw new Error(`Specification validation failed: ${errors.join(", ")}`);
    }

    console.log("Spec validation passed successfully");
  }

  static getCharacterCounts(spec: ProjectSpec): Record<string, number> {
    return {
      projectDescription: spec.projectDescription?.length || 0,
      additionalFeatures: spec.additionalFeatures?.length || 0,
      a2aIntegrationDetails: spec.a2aIntegrationDetails?.length || 0,
      advancedPromptDetails: spec.advancedPromptDetails?.length || 0
    };
  }

  static getValidationLimits(): Record<string, number> {
    return {
      projectDescription: 5000,
      additionalFeatures: 3000,
      a2aIntegrationDetails: 2000,
      advancedPromptDetails: 2000
    };
  }
}
