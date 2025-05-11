
import React, { useState } from "react";
import { Sparkles, X, Database, Brain, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

const FRONTEND_OPTIONS: TechStack[] = ["React", "Next.js", "Vue", "Angular"];
const BACKEND_OPTIONS: TechStack[] = ["Express", "NestJS", "FastAPI", "Django"];
const DATABASE_OPTIONS: TechStack[] = ["PostgreSQL", "MongoDB", "Redis"];
const ADDITIONAL_OPTIONS: TechStack[] = ["Docker"];

const VECTOR_DB_OPTIONS: VectorDatabaseType[] = ["Pinecone", "Weaviate", "Milvus", "Qdrant", "Chroma", "PGVector", "None"];
const MCP_OPTIONS: MCPType[] = ["Chain-of-Thought", "LLM-Avalanche", "ReAct", "Agent-Critic", "None"];

const ProjectSpecForm: React.FC<ProjectSpecFormProps> = ({ onSubmit }) => {
  const [spec, setSpec] = useState<ProjectSpec>({
    projectDescription: "",
    frontendTechStack: ["React"],
    backendTechStack: ["Express"],
    a2aIntegrationDetails: "",
    additionalFeatures: "",
    ragVectorDb: "None",
    mcpType: "None",
    advancedPromptDetails: ""
  });

  const handleTechStackToggle = (tech: TechStack, type: "frontend" | "backend") => {
    if (type === "frontend") {
      if (spec.frontendTechStack.includes(tech)) {
        setSpec({
          ...spec,
          frontendTechStack: spec.frontendTechStack.filter((t) => t !== tech),
        });
      } else {
        setSpec({
          ...spec,
          frontendTechStack: [...spec.frontendTechStack, tech],
        });
      }
    } else {
      if (spec.backendTechStack.includes(tech)) {
        setSpec({
          ...spec,
          backendTechStack: spec.backendTechStack.filter((t) => t !== tech),
        });
      } else {
        setSpec({
          ...spec,
          backendTechStack: [...spec.backendTechStack, tech],
        });
      }
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
      a2aIntegrationDetails: "Implement agent-to-agent communication for task assignment and notification subsystems.",
      additionalFeatures: "User authentication, role-based permissions, kanban board view, activity timeline, and email notifications.",
      ragVectorDb: "PGVector",
      mcpType: "ReAct",
      advancedPromptDetails: "Leverage semantic search for smart task matching. Implement RAG 2.0 with hybrid search and metadata filtering for knowledge retrieval. Use ReAct pattern for agent decision making."
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
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Description</label>
            <Textarea 
              placeholder="Describe your project in detail..."
              className="min-h-[100px]"
              value={spec.projectDescription}
              onChange={(e) => setSpec({ ...spec, projectDescription: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Frontend Tech Stack</label>
            <div className="flex flex-wrap gap-2">
              {FRONTEND_OPTIONS.map((tech) => (
                <Badge 
                  key={tech}
                  variant={spec.frontendTechStack.includes(tech) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    spec.frontendTechStack.includes(tech) ? "bg-ipa-primary" : ""
                  }`}
                  onClick={() => handleTechStackToggle(tech, "frontend")}
                >
                  {tech}
                  {spec.frontendTechStack.includes(tech) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Backend Tech Stack</label>
            <div className="flex flex-wrap gap-2">
              {[...BACKEND_OPTIONS, ...DATABASE_OPTIONS, ...ADDITIONAL_OPTIONS].map((tech) => (
                <Badge 
                  key={tech}
                  variant={spec.backendTechStack.includes(tech) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    spec.backendTechStack.includes(tech) ? "bg-ipa-secondary" : ""
                  }`}
                  onClick={() => handleTechStackToggle(tech, "backend")}
                >
                  {tech}
                  {spec.backendTechStack.includes(tech) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TooltipProvider>
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium">
                  <Database className="h-4 w-4" /> 
                  RAG 2.0 Vector Database
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help ml-1 text-xs bg-ipa-muted/30 px-1 rounded">?</span>
                    </TooltipTrigger>
                    <TooltipContent className="w-64 p-3">
                      <p>Select a vector database for RAG 2.0 implementation. This enables advanced semantic search and document retrieval in your AI system.</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Select 
                  value={spec.ragVectorDb}
                  onValueChange={(value: VectorDatabaseType) => setSpec({ ...spec, ragVectorDb: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vector Database" />
                  </SelectTrigger>
                  <SelectContent>
                    {VECTOR_DB_OPTIONS.map((db) => (
                      <SelectItem key={db} value={db}>
                        {db}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TooltipProvider>

            <TooltipProvider>
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium">
                  <Brain className="h-4 w-4" /> 
                  Multi-Chain Protocol
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help ml-1 text-xs bg-ipa-muted/30 px-1 rounded">?</span>
                    </TooltipTrigger>
                    <TooltipContent className="w-64 p-3">
                      <p>Select a Multi-Chain Protocol (MCP) for enhanced reasoning and decision-making capabilities in your prompt.</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Select 
                  value={spec.mcpType}
                  onValueChange={(value: MCPType) => setSpec({ ...spec, mcpType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    {MCP_OPTIONS.map((protocol) => (
                      <SelectItem key={protocol} value={protocol}>
                        {protocol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium">
              <Network className="h-4 w-4" /> 
              A2A Integration Details
            </label>
            <Textarea 
              placeholder="Describe how Agent-to-Agent communication should be implemented..."
              className="min-h-[80px]"
              value={spec.a2aIntegrationDetails}
              onChange={(e) => setSpec({ ...spec, a2aIntegrationDetails: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Advanced Prompt Engineering Details</label>
            <Textarea 
              placeholder="Specify any advanced prompt engineering techniques, RAG strategies, or MCP patterns..."
              className="min-h-[80px]"
              value={spec.advancedPromptDetails}
              onChange={(e) => setSpec({ ...spec, advancedPromptDetails: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Additional Features</label>
            <Textarea 
              placeholder="Specify any additional features or requirements..."
              className="min-h-[80px]"
              value={spec.additionalFeatures}
              onChange={(e) => setSpec({ ...spec, additionalFeatures: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-blue-purple hover:opacity-90">
            Generate Cursor Prompt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectSpecForm;
