
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VectorDatabaseType, MCPType } from "@/types/ipa-types";

interface AdvancedFeaturesSectionProps {
  ragVectorDb: VectorDatabaseType;
  customRagVectorDb: string;
  mcpType: MCPType;
  customMcpType: string;
  a2aIntegrationDetails: string;
  advancedPromptDetails: string;
  additionalFeatures: string;
  onVectorDbChange: (value: string) => void;
  onMcpTypeChange: (value: string) => void;
  onSaveCustomVectorDb: (value: string) => void;
  onSaveCustomMcp: (value: string) => void;
  onFieldChange: (field: string, value: string) => void;
}

const AdvancedFeaturesSection: React.FC<AdvancedFeaturesSectionProps> = ({
  ragVectorDb,
  customRagVectorDb,
  mcpType,
  customMcpType,
  a2aIntegrationDetails,
  advancedPromptDetails,
  additionalFeatures,
  onVectorDbChange,
  onMcpTypeChange,
  onSaveCustomVectorDb,
  onSaveCustomMcp,
  onFieldChange
}) => {
  const [customVectorInput, setCustomVectorInput] = React.useState("");
  const [customMcpInput, setCustomMcpInput] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RAG Vector Database */}
        <div className="space-y-2">
          <Label>RAG Vector Database</Label>
          <Select value={ragVectorDb} onValueChange={onVectorDbChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select vector database" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Chroma">Chroma</SelectItem>
              <SelectItem value="Pinecone">Pinecone</SelectItem>
              <SelectItem value="Weaviate">Weaviate</SelectItem>
              <SelectItem value="Qdrant">Qdrant</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {ragVectorDb === "Custom" && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom vector database"
                value={customVectorInput}
                onChange={(e) => setCustomVectorInput(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onSaveCustomVectorDb(customVectorInput);
                  setCustomVectorInput("");
                }}
              >
                Save
              </Button>
            </div>
          )}
        </div>

        {/* MCP Type */}
        <div className="space-y-2">
          <Label>MCP Integration</Label>
          <Select value={mcpType} onValueChange={onMcpTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select MCP type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Standard MCP">Standard MCP</SelectItem>
              <SelectItem value="Enhanced MCP">Enhanced MCP</SelectItem>
              <SelectItem value="Enterprise MCP">Enterprise MCP</SelectItem>
              <SelectItem value="Custom MCP Implementation">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {mcpType === "Custom MCP Implementation" && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom MCP type"
                value={customMcpInput}
                onChange={(e) => setCustomMcpInput(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onSaveCustomMcp(customMcpInput);
                  setCustomMcpInput("");
                }}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <TextAreaField
        label="A2A Integration Details"
        placeholder="Describe agent-to-agent communication requirements, protocols, and integration patterns..."
        value={a2aIntegrationDetails}
        onChange={(value) => onFieldChange("a2aIntegrationDetails", value)}
        maxLength={2000}
      />

      <TextAreaField
        label="Advanced Prompt Details"
        placeholder="Specify advanced prompting strategies, context management, and AI behavior customizations..."
        value={advancedPromptDetails}
        onChange={(value) => onFieldChange("advancedPromptDetails", value)}
        maxLength={2000}
      />

      <TextAreaField
        label="Additional Features"
        placeholder="List any additional features, integrations, or specific requirements not covered above..."
        value={additionalFeatures}
        onChange={(value) => onFieldChange("additionalFeatures", value)}
        maxLength={3000}
      />
    </div>
  );
};

export default AdvancedFeaturesSection;
