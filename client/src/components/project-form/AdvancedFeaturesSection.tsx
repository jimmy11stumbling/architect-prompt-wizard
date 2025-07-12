
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VectorDatabase, MCPType } from "@/types/ipa-types";
import CustomOptionSelector from "./CustomOptionSelector";

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
  onFieldChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Label className="text-lg font-medium">Advanced Features</Label>
        <p className="text-sm text-muted-foreground">
          Configure advanced RAG, MCP, and A2A integration features for your project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ragVectorDb">RAG Vector Database</Label>
            <CustomOptionSelector
              title="RAG Vector Database"
              description="Choose a vector database for RAG 2.0 implementation"
              options={["None", "Pinecone", "Weaviate", "Chroma", "Qdrant", "Milvus", "pgvector"]}
              value={ragVectorDb || "None"}
              onChange={onVectorDbChange}
              customValue={customRagVectorDb}
              onSaveCustom={onSaveCustomVectorDb}
              placeholder="Select vector database"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mcpType">MCP (Model Context Protocol)</Label>
            <CustomOptionSelector
              title="MCP Protocol Type"
              description="Model Context Protocol by Anthropic - standardized JSON-RPC 2.0 for AI system integrations"
              options={["None", "Anthropic MCP", "JSON-RPC Tools", "Custom MCP Server", "MCP Hub Integration"]}
              value={mcpType || "None"}
              onChange={onMcpTypeChange}
              customValue={customMcpType}
              onSaveCustom={onSaveCustomMcp}
              placeholder="Select MCP implementation"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="a2aIntegrationDetails">A2A Integration Details</Label>
            <Textarea
              id="a2aIntegrationDetails"
              placeholder="Describe agent-to-agent communication patterns, coordination strategies, and multi-agent workflows..."
              value={a2aIntegrationDetails}
              onChange={(e) => onFieldChange("a2aIntegrationDetails", e.target.value)}
              className="min-h-[120px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Specify how agents should communicate and coordinate with each other
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advancedPromptDetails">Advanced Prompt Details</Label>
            <Textarea
              id="advancedPromptDetails"
              placeholder="Specify advanced prompting strategies, context management, RAG integration patterns, and sophisticated AI coordination techniques..."
              value={advancedPromptDetails}
              onChange={(e) => onFieldChange("advancedPromptDetails", e.target.value)}
              className="min-h-[120px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Detail advanced prompting techniques and AI coordination strategies
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additionalFeatures">Additional Features & Requirements</Label>
          <Textarea
            id="additionalFeatures"
            placeholder="Describe any additional features, specific requirements, or custom functionality..."
            value={additionalFeatures}
            onChange={(e) => onFieldChange("additionalFeatures", e.target.value)}
            className="min-h-[100px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Any other specific requirements or features for your project
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesSection;
