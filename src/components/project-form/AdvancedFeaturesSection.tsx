
import React from "react";
import { Database, Brain, Network, Code } from "lucide-react";
import { CustomOptionSelector, TextAreaField } from "./";
import { VectorDatabaseType, MCPType } from "@/types/ipa-types";

const VECTOR_DB_OPTIONS: VectorDatabaseType[] = ["Pinecone", "Weaviate", "Milvus", "Qdrant", "Chroma", "PGVector", "None"];
const MCP_OPTIONS: MCPType[] = ["Standard MCP", "Extended MCP", "MCP with Tools", "MCP with Resources", "None"];

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
  onSaveCustomVectorDb: (customValue: string) => void;
  onSaveCustomMcp: (customValue: string) => void;
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomOptionSelector
          icon={<Database className="h-4 w-4" />}
          title="RAG 2.0 Vector Database"
          description="Select a vector database for RAG 2.0 implementation. This enables advanced semantic search and document retrieval in your AI system."
          options={VECTOR_DB_OPTIONS}
          value={ragVectorDb}
          onChange={onVectorDbChange}
          customValue={customRagVectorDb}
          onSaveCustom={onSaveCustomVectorDb}
        />

        <CustomOptionSelector
          icon={<Brain className="h-4 w-4" />}
          title="Model Context Protocol"
          description="Select a Model Context Protocol (MCP) type for connecting AI models with external tools and data sources in your application."
          options={MCP_OPTIONS}
          value={mcpType}
          onChange={onMcpTypeChange}
          customValue={customMcpType}
          onSaveCustom={onSaveCustomMcp}
        />
      </div>

      <TextAreaField
        label="A2A Integration Details"
        icon={<Network className="h-4 w-4" />}
        placeholder="Describe how Agent-to-Agent communication should be implemented..."
        value={a2aIntegrationDetails}
        onChange={(value) => onFieldChange("a2aIntegrationDetails", value)}
      />

      <TextAreaField
        label="Advanced Prompt Engineering Details"
        icon={<Code className="h-4 w-4" />}
        placeholder="Specify any advanced prompt engineering techniques, RAG strategies, or MCP patterns..."
        value={advancedPromptDetails}
        onChange={(value) => onFieldChange("advancedPromptDetails", value)}
      />

      <TextAreaField
        label="Additional Features"
        placeholder="Specify any additional features or requirements..."
        value={additionalFeatures}
        onChange={(value) => onFieldChange("additionalFeatures", value)}
      />
    </>
  );
};

export default AdvancedFeaturesSection;
