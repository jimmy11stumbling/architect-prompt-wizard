
import React from "react";
import { Database, Brain, Network, Code, Zap, Shield } from "lucide-react";
import { CustomOptionSelector, TextAreaField } from "./";
import { VectorDatabaseType, MCPType } from "@/types/ipa-types";

const VECTOR_DB_OPTIONS: VectorDatabaseType[] = [
  "Pinecone", 
  "Weaviate", 
  "Milvus", 
  "Qdrant", 
  "Chroma", 
  "PGVector", 
  "FAISS",
  "Elasticsearch",
  "OpenSearch",
  "None"
];

const MCP_OPTIONS: MCPType[] = [
  "Standard MCP", 
  "Extended MCP", 
  "MCP with Tools", 
  "MCP with Resources", 
  "MCP with Prompts",
  "MCP with Sampling",
  "Custom MCP Implementation",
  "None"
];

const DEPLOYMENT_OPTIONS = [
  "Vercel",
  "Netlify", 
  "AWS",
  "Google Cloud",
  "Azure",
  "Digital Ocean",
  "Heroku",
  "Railway",
  "Render",
  "Self-hosted"
];

const AUTHENTICATION_OPTIONS = [
  "JWT",
  "OAuth 2.0",
  "Auth0",
  "Firebase Auth",
  "Supabase Auth",
  "NextAuth.js",
  "Passport.js",
  "Custom Auth",
  "None"
];

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
  const [deploymentPreference, setDeploymentPreference] = React.useState("Vercel");
  const [authPreference, setAuthPreference] = React.useState("JWT");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomOptionSelector
          icon={<Database className="h-4 w-4" />}
          title="RAG 2.0 Vector Database"
          description="Select a vector database for RAG 2.0 implementation. This enables advanced semantic search and document retrieval in your AI system with hybrid search capabilities."
          options={VECTOR_DB_OPTIONS}
          value={ragVectorDb}
          onChange={onVectorDbChange}
          customValue={customRagVectorDb}
          onSaveCustom={onSaveCustomVectorDb}
        />

        <CustomOptionSelector
          icon={<Brain className="h-4 w-4" />}
          title="Model Context Protocol"
          description="Select a Model Context Protocol (MCP) type for connecting AI models with external tools and data sources. MCP enables standardized communication between AI agents and external systems."
          options={MCP_OPTIONS}
          value={mcpType}
          onChange={onMcpTypeChange}
          customValue={customMcpType}
          onSaveCustom={onSaveCustomMcp}
        />

        <CustomOptionSelector
          icon={<Zap className="h-4 w-4" />}
          title="Deployment Platform"
          description="Choose your preferred deployment platform for hosting your application with optimal performance and scalability."
          options={DEPLOYMENT_OPTIONS}
          value={deploymentPreference}
          onChange={setDeploymentPreference}
          customValue=""
          onSaveCustom={() => {}}
        />

        <CustomOptionSelector
          icon={<Shield className="h-4 w-4" />}
          title="Authentication Method"
          description="Select the authentication and authorization method for secure user management and access control."
          options={AUTHENTICATION_OPTIONS}
          value={authPreference}
          onChange={setAuthPreference}
          customValue=""
          onSaveCustom={() => {}}
        />
      </div>

      <TextAreaField
        label="A2A Integration Details"
        icon={<Network className="h-4 w-4" />}
        placeholder="Describe how Agent-to-Agent communication should be implemented. Include details about message passing, coordination protocols, task delegation, and inter-agent workflows..."
        value={a2aIntegrationDetails}
        onChange={(value) => onFieldChange("a2aIntegrationDetails", value)}
        minHeight="120px"
      />

      <TextAreaField
        label="Advanced Prompt Engineering Details"
        icon={<Code className="h-4 w-4" />}
        placeholder="Specify advanced prompt engineering techniques, RAG strategies, MCP patterns, context optimization, and AI model fine-tuning requirements..."
        value={advancedPromptDetails}
        onChange={(value) => onFieldChange("advancedPromptDetails", value)}
        minHeight="120px"
      />

      <TextAreaField
        label="Additional Features & Requirements"
        placeholder="Specify any additional features, integrations, performance requirements, security considerations, or special functionality needed for your application..."
        value={additionalFeatures}
        onChange={(value) => onFieldChange("additionalFeatures", value)}
        minHeight="120px"
      />
    </div>
  );
};

export default AdvancedFeaturesSection;
