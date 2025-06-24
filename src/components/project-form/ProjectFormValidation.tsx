
import React from "react";
import { ProjectSpec } from "@/types/ipa-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { SpecValidator } from "@/services/ipa/validation/specValidator";

interface ProjectFormValidationProps {
  spec: ProjectSpec;
}

const ProjectFormValidation: React.FC<ProjectFormValidationProps> = ({ spec }) => {
  const characterCounts = SpecValidator.getCharacterCounts(spec);
  const limits = SpecValidator.getValidationLimits();
  
  const validationIssues: string[] = [];
  
  // Check required fields
  if (!spec.projectDescription?.trim()) {
    validationIssues.push("Project description is required");
  }
  
  if (!spec.frontendTechStack?.length) {
    validationIssues.push("At least one frontend technology is required");
  }
  
  if (!spec.backendTechStack?.length) {
    validationIssues.push("At least one backend technology is required");
  }

  // Check character limits
  Object.entries(characterCounts).forEach(([field, count]) => {
    const limit = limits[field];
    if (count > limit) {
      const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
      validationIssues.push(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} exceeds ${limit} character limit (${count}/${limit})`);
    }
  });

  const isValid = validationIssues.length === 0;

  return (
    <div className="space-y-4">
      {/* Character Count Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(characterCounts).map(([field, count]) => {
          const limit = limits[field];
          const percentage = (count / limit) * 100;
          const isOverLimit = count > limit;
          const isWarning = percentage > 80;
          
          return (
            <div key={field} className="text-center">
              <Badge
                variant={isOverLimit ? "destructive" : isWarning ? "secondary" : "outline"}
                className="w-full"
              >
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Badge>
              <div className={`text-xs mt-1 ${isOverLimit ? 'text-destructive' : isWarning ? 'text-orange-600' : 'text-muted-foreground'}`}>
                {count}/{limit}
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Status */}
      {isValid ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All validation requirements met. Ready to generate prompt!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Please fix the following issues:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>Tips:</strong> Be specific but concise. The AI agents work best with clear, detailed requirements. 
          Focus on core functionality and let the agents help with implementation details.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProjectFormValidation;
