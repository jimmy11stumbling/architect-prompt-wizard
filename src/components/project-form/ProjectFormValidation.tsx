
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

interface ProjectFormValidationProps {
  spec: ProjectSpec;
}

const ProjectFormValidation: React.FC<ProjectFormValidationProps> = ({ spec }) => {
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  // Required field validation
  if (!spec.projectDescription.trim()) {
    validationErrors.push("Project description is required");
  }

  if (spec.frontendTechStack.length === 0) {
    validationErrors.push("At least one frontend technology must be selected");
  }

  if (spec.backendTechStack.length === 0) {
    validationErrors.push("At least one backend technology must be selected");
  }

  // Recommendations and warnings
  if (spec.projectDescription.length < 50) {
    validationWarnings.push("Consider providing a more detailed project description (minimum 50 characters recommended)");
  }

  if (spec.ragVectorDb === "None" && spec.mcpType === "None") {
    validationWarnings.push("Consider adding RAG or MCP features for enhanced AI capabilities");
  }

  if (!spec.a2aIntegrationDetails.trim()) {
    validationWarnings.push("A2A integration details would help generate more specific agent communication patterns");
  }

  const isValid = validationErrors.length === 0;

  if (isValid && validationWarnings.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Your project specification is complete and ready for prompt generation!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Please fix the following errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationWarnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-medium mb-1">Recommendations:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProjectFormValidation;
