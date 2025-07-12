import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VectorDatabase, MCPType } from "@/types/ipa-types";

interface AdvancedFeaturesSectionProps {
  ragVectorDb: VectorDatabase;
  customRagVectorDb: string;
  mcpType: MCPType;
  customMcpType: string;
  a2aIntegrationDetails: string;
  advancedPromptDetails: string;
  additionalFeatures: string;
  onVectorDbChange: (value: VectorDatabase) => void;
  onMcpTypeChange: (value: MCPType) => void;
  onSaveCustomVectorDb: (value: string) => void;
  onSaveCustomMcp: (value: string) => void;
  onFieldChange: (field: string, value: string) => void;
}

const AdvancedFeaturesSection: React.FC<AdvancedFeaturesSectionProps> = ({
  a2aIntegrationDetails,
  advancedPromptDetails,
  additionalFeatures,
  onFieldChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Label className="text-lg font-medium">Advanced Features</Label>
        <p className="text-sm text-muted-foreground">
          The blueprint will automatically configure advanced features based on your platform's capabilities.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additionalFeatures">Additional Features</Label>
          <Textarea
            id="additionalFeatures"
            placeholder="Describe any additional features or specific requirements..."
            value={additionalFeatures}
            onChange={(e) => onFieldChange("additionalFeatures", e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesSection;