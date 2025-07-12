import React from "react";
import { Label } from "@/components/ui/label";
import { TechStack } from "@/types/ipa-types";

interface TechStackSectionProps {
  frontendTechStack: TechStack[];
  backendTechStack: TechStack[];
  customFrontendTech: string[];
  customBackendTech: string[];
  onTechStackToggle: (tech: TechStack, type: "frontend" | "backend") => void;
  onAddCustomTech: (tech: string, type: "frontend" | "backend") => void;
  onRemoveCustomTech: (tech: string, type: "frontend" | "backend") => void;
}

const TechStackSection: React.FC<TechStackSectionProps> = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Label className="text-lg font-medium">Technology Stack</Label>
        <p className="text-sm text-muted-foreground">
          The blueprint will automatically configure the optimal technology stack based on your selected platform's capabilities and your project requirements.
        </p>
      </div>
    </div>
  );
};

export default TechStackSection;