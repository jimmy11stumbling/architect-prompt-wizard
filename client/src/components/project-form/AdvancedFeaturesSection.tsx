
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

      <div className="space-y-2">
        <Label htmlFor="a2aIntegrationDetails">A2A Integration Details</Label>
        <Textarea
          id="a2aIntegrationDetails"
          placeholder="Describe agent-to-agent communication requirements, protocols, and integration patterns..."
          value={a2aIntegrationDetails}
          onChange={(e) => onFieldChange("a2aIntegrationDetails", e.target.value)}
          maxLength={2000}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="advancedPromptDetails">Advanced Prompt Details</Label>
        <Textarea
          id="advancedPromptDetails"
          placeholder="Specify advanced prompting strategies, context management, and AI behavior customizations..."
          value={advancedPromptDetails}
          onChange={(e) => onFieldChange("advancedPromptDetails", e.target.value)}
          maxLength={2000}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalFeatures">Additional Features</Label>
        <Textarea
          id="additionalFeatures"
          placeholder="List any additional features, integrations, or specific requirements not covered above..."
          value={additionalFeatures}
          onChange={(e) => onFieldChange("additionalFeatures", e.target.value)}
          maxLength={3000}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default AdvancedFeaturesSection;
