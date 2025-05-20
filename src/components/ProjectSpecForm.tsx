
import React, { useState } from "react";
import { Sparkles, Database, Brain, Network, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";
import { TechStackSelector, CustomOptionSelector, TextAreaField } from "./project-form";

const FRONTEND_OPTIONS: TechStack[] = ["React", "Next.js", "Vue", "Angular"];
const BACKEND_OPTIONS: TechStack[] = ["Express", "NestJS", "FastAPI", "Django"];
const DATABASE_OPTIONS: TechStack[] = ["PostgreSQL", "MongoDB", "Redis"];
const ADDITIONAL_OPTIONS: TechStack[] = ["Docker"];

const VECTOR_DB_OPTIONS: VectorDatabaseType[] = ["Pinecone", "Weaviate", "Milvus", "Qdrant", "Chroma", "PGVector", "None"];
const MCP_OPTIONS: MCPType[] = ["Standard MCP", "Extended MCP", "MCP with Tools", "MCP with Resources", "None"];

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

const ProjectSpecForm: React.FC<ProjectSpecFormProps> = ({ onSubmit }) => {
  const [spec, setSpec] = useState<ProjectSpec>({
    projectDescription: "",
    frontendTechStack: ["React"],
    backendTechStack: ["Express"],
    customFrontendTech: [],
    customBackendTech: [],
    a2aIntegrationDetails: "",
    additionalFeatures: "",
    ragVectorDb: "None",
    customRagVectorDb: "",
    mcpType: "None",
    customMcpType: "",
    advancedPromptDetails: ""
  });
  
  const handleTechStackToggle = (tech: TechStack, type: "frontend" | "backend") => {
    if (type === "frontend") {
      setSpec({
        ...spec,
        frontendTechStack: spec.frontendTechStack.includes(tech)
          ? spec.frontendTechStack.filter((t) => t !== tech)
          : [...spec.frontendTechStack, tech],
      });
    } else {
      setSpec({
        ...spec,
        backendTechStack: spec.backendTechStack.includes(tech)
          ? spec.backendTechStack.filter((t) => t !== tech)
          : [...spec.backendTechStack, tech],
      });
    }
  };

  const addCustomFrontendTech = (tech: string) => {
    if (!spec.customFrontendTech.includes(tech)) {
      setSpec({
        ...spec,
        customFrontendTech: [...spec.customFrontendTech, tech]
      });
    }
  };

  const addCustomBackendTech = (tech: string) => {
    if (!spec.customBackendTech.includes(tech)) {
      setSpec({
        ...spec,
        customBackendTech: [...spec.customBackendTech, tech]
      });
    }
  };

  const removeCustomTech = (tech: string, type: "frontend" | "backend") => {
    if (type === "frontend") {
      setSpec({
        ...spec,
        customFrontendTech: spec.customFrontendTech.filter(t => t !== tech)
      });
    } else {
      setSpec({
        ...spec,
        customBackendTech: spec.customBackendTech.filter(t => t !== tech)
      });
    }
  };

  const handleVectorDbChange = (value: string) => {
    setSpec({
      ...spec,
      ragVectorDb: value as VectorDatabaseType
    });
  };

  const handleMcpTypeChange = (value: string) => {
    setSpec({
      ...spec,
      mcpType: value as MCPType
    });
  };

  const saveCustomVectorDb = (customValue: string) => {
    if (customValue.trim()) {
      setSpec({
        ...spec,
        ragVectorDb: customValue as VectorDatabaseType,
        customRagVectorDb: customValue
      });
    }
  };

  const saveCustomMcp = (customValue: string) => {
    if (customValue.trim()) {
      setSpec({
        ...spec,
        mcpType: customValue as MCPType,
        customMcpType: customValue
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(spec);
  };

  const handleQuickFill = () => {
    // Example quick fill for demo purposes with advanced features
    setSpec({
      projectDescription: "A collaborative task management app with real-time updates and A2A communication.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "ShadCN UI"],
      customBackendTech: ["Redis Pub/Sub", "WebSockets"],
      a2aIntegrationDetails: "Implement agent-to-agent communication for task assignment and notification subsystems.",
      additionalFeatures: "User authentication, role-based permissions, kanban board view, activity timeline, and email notifications.",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "Leverage semantic search for smart task matching. Implement RAG 2.0 with hybrid search and metadata filtering for knowledge retrieval. Use Model Context Protocol for tools integration in agent workflows."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Specifications</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={handleQuickFill}
          >
            <Sparkles className="h-4 w-4 text-ipa-accent" /> Quick Fill Example
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextAreaField
            label="Project Description"
            placeholder="Describe your project in detail..."
            value={spec.projectDescription}
            onChange={(value) => setSpec({ ...spec, projectDescription: value })}
            required={true}
            minHeight="100px"
          />

          <TechStackSelector
            title="Frontend Tech Stack"
            options={FRONTEND_OPTIONS}
            selectedTechs={spec.frontendTechStack}
            customTechs={spec.customFrontendTech}
            onToggleTech={(tech) => handleTechStackToggle(tech, "frontend")}
            onAddCustomTech={addCustomFrontendTech}
            onRemoveCustomTech={(tech) => removeCustomTech(tech, "frontend")}
            bgColorClass="bg-ipa-primary"
          />

          <TechStackSelector
            title="Backend Tech Stack"
            options={[...BACKEND_OPTIONS, ...DATABASE_OPTIONS, ...ADDITIONAL_OPTIONS]}
            selectedTechs={spec.backendTechStack}
            customTechs={spec.customBackendTech}
            onToggleTech={(tech) => handleTechStackToggle(tech, "backend")}
            onAddCustomTech={addCustomBackendTech}
            onRemoveCustomTech={(tech) => removeCustomTech(tech, "backend")}
            bgColorClass="bg-ipa-secondary"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomOptionSelector
              icon={<Database className="h-4 w-4" />}
              title="RAG 2.0 Vector Database"
              description="Select a vector database for RAG 2.0 implementation. This enables advanced semantic search and document retrieval in your AI system."
              options={VECTOR_DB_OPTIONS}
              value={spec.ragVectorDb}
              onChange={handleVectorDbChange}
              customValue={spec.customRagVectorDb}
              onSaveCustom={saveCustomVectorDb}
            />

            <CustomOptionSelector
              icon={<Brain className="h-4 w-4" />}
              title="Model Context Protocol"
              description="Select a Model Context Protocol (MCP) type for connecting AI models with external tools and data sources in your application."
              options={MCP_OPTIONS}
              value={spec.mcpType}
              onChange={handleMcpTypeChange}
              customValue={spec.customMcpType}
              onSaveCustom={saveCustomMcp}
            />
          </div>

          <TextAreaField
            label="A2A Integration Details"
            icon={<Network className="h-4 w-4" />}
            placeholder="Describe how Agent-to-Agent communication should be implemented..."
            value={spec.a2aIntegrationDetails}
            onChange={(value) => setSpec({ ...spec, a2aIntegrationDetails: value })}
          />

          <TextAreaField
            label="Advanced Prompt Engineering Details"
            icon={<Code className="h-4 w-4" />}
            placeholder="Specify any advanced prompt engineering techniques, RAG strategies, or MCP patterns..."
            value={spec.advancedPromptDetails}
            onChange={(value) => setSpec({ ...spec, advancedPromptDetails: value })}
          />

          <TextAreaField
            label="Additional Features"
            placeholder="Specify any additional features or requirements..."
            value={spec.additionalFeatures}
            onChange={(value) => setSpec({ ...spec, additionalFeatures: value })}
          />

          <Button type="submit" className="w-full bg-gradient-blue-purple hover:opacity-90">
            Generate Cursor Prompt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectSpecForm;
