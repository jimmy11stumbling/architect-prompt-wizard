
import { ProjectSpec } from "@/types/ipa-types";

export class SpecValidator {
  static validate(spec: ProjectSpec): void {
    const errors: string[] = [];

    // Required fields validation
    if (!spec.projectDescription || spec.projectDescription.trim().length === 0) {
      errors.push("Project description is required");
    }

    if (!spec.frontendTechStack || spec.frontendTechStack.length === 0) {
      errors.push("At least one frontend technology is required");
    }

    if (!spec.backendTechStack || spec.backendTechStack.length === 0) {
      errors.push("At least one backend technology is required");
    }

    // Length validations
    if (spec.projectDescription && spec.projectDescription.length > 2000) {
      errors.push("Project description must be less than 2000 characters");
    }

    if (spec.additionalFeatures && spec.additionalFeatures.length > 1000) {
      errors.push("Additional features must be less than 1000 characters");
    }

    // Business logic validations
    if (spec.frontendTechStack.length > 10) {
      errors.push("Too many frontend technologies selected (max 10)");
    }

    if (spec.backendTechStack.length > 10) {
      errors.push("Too many backend technologies selected (max 10)");
    }

    if (errors.length > 0) {
      console.error("❌ Spec validation failed:", errors);
      throw new Error(`Specification validation failed: ${errors.join(", ")}`);
    }

    console.log("✅ Spec validation passed");
  }
}
