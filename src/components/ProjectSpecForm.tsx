import React, { useState } from "react";
import { Sparkles, X, Database, Brain, Network, Plus, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack, VectorDatabaseType, MCPType } from "@/types/ipa-types";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

const FRONTEND_OPTIONS: TechStack[] = ["React", "Next.js", "Vue", "Angular"];
const BACKEND_OPTIONS: TechStack[] = ["Express", "NestJS", "FastAPI", "Django"];
const DATABASE_OPTIONS: TechStack[] = ["PostgreSQL", "MongoDB", "Redis"];
const ADDITIONAL_OPTIONS: TechStack[] = ["Docker"];

const VECTOR_DB_OPTIONS: VectorDatabaseType[] = ["Pinecone", "Weaviate", "Milvus", "Qdrant", "Chroma", "PGVector", "None"];
const MCP_OPTIONS: MCPType[] = ["Standard MCP", "Extended MCP", "MCP with Tools", "MCP with Resources", "None"];

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
  
  const [newCustomFrontend, setNewCustomFrontend] = useState("");
  const [newCustomBackend, setNewCustomBackend] = useState("");
  const [customVectorDb, setCustomVectorDb] = useState("");
  const [customMcp, setCustomMcp] = useState("");

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

  const addCustomFrontendTech = () => {
    if (newCustomFrontend.trim() !== "" && !spec.customFrontendTech.includes(newCustomFrontend)) {
      setSpec({
        ...spec,
        customFrontendTech: [...spec.customFrontendTech, newCustomFrontend.trim()]
      });
      setNewCustomFrontend("");
    }
  };

  const addCustomBackendTech = () => {
    if (newCustomBackend.trim() !== "" && !spec.customBackendTech.includes(newCustomBackend)) {
      setSpec({
        ...spec,
        customBackendTech: [...spec.customBackendTech, newCustomBackend.trim()]
      });
      setNewCustomBackend("");
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

  const saveCustomVectorDb = () => {
    if (customVectorDb.trim()) {
      setSpec({
        ...spec,
        ragVectorDb: customVectorDb as VectorDatabaseType,
        customRagVectorDb: customVectorDb
      });
    }
  };

  const saveCustomMcp = () => {
    if (customMcp.trim()) {
      setSpec({
        ...spec,
        mcpType: customMcp as MCPType,
        customMcpType: customMcp
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
            <label className="block text-sm font-medium flex items-center justify-between">
              <span>Frontend Tech Stack</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-3 w-3" /> Add Custom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Frontend Technology</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Input 
                      placeholder="Enter custom frontend technology..."
                      value={newCustomFrontend}
                      onChange={(e) => setNewCustomFrontend(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={addCustomFrontendTech}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </label>
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
              {spec.customFrontendTech.map((tech) => (
                <Badge 
                  key={tech}
                  variant="default"
                  className="cursor-pointer bg-ipa-accent"
                >
                  {tech}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removeCustomTech(tech, "frontend")} 
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium flex items-center justify-between">
              <span>Backend Tech Stack</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-3 w-3" /> Add Custom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Backend Technology</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Input 
                      placeholder="Enter custom backend technology..."
                      value={newCustomBackend}
                      onChange={(e) => setNewCustomBackend(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={addCustomBackendTech}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </label>
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
              {spec.customBackendTech.map((tech) => (
                <Badge 
                  key={tech}
                  variant="default"
                  className="cursor-pointer bg-ipa-accent"
                >
                  {tech}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removeCustomTech(tech, "backend")} 
                  />
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
                <div className="flex items-center gap-2">
                  <Select 
                    value={spec.ragVectorDb}
                    onValueChange={(value: VectorDatabaseType) => setSpec({ ...spec, ragVectorDb: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Vector Database" />
                    </SelectTrigger>
                    <SelectContent>
                      {VECTOR_DB_OPTIONS.map((db) => (
                        <SelectItem key={db} value={db}>
                          {db}
                        </SelectItem>
                      ))}
                      {spec.customRagVectorDb && spec.customRagVectorDb !== "Custom" && (
                        <SelectItem value={spec.customRagVectorDb}>
                          {spec.customRagVectorDb}
                        </SelectItem>
                      )}
                      <SelectItem value="Custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-3 w-3" /> Custom
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Vector Database</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input 
                          placeholder="Enter custom vector database..."
                          value={customVectorDb}
                          onChange={(e) => setCustomVectorDb(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" onClick={saveCustomVectorDb}>Add</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TooltipProvider>

            <TooltipProvider>
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium">
                  <Brain className="h-4 w-4" /> 
                  Model Context Protocol
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help ml-1 text-xs bg-ipa-muted/30 px-1 rounded">?</span>
                    </TooltipTrigger>
                    <TooltipContent className="w-64 p-3">
                      <p>Select a Model Context Protocol (MCP) type for connecting AI models with external tools and data sources in your application.</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <div className="flex items-center gap-2">
                  <Select 
                    value={spec.mcpType}
                    onValueChange={(value: MCPType) => setSpec({ ...spec, mcpType: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {MCP_OPTIONS.map((protocol) => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol}
                        </SelectItem>
                      ))}
                      {spec.customMcpType && spec.customMcpType !== "Custom" && (
                        <SelectItem value={spec.customMcpType}>
                          {spec.customMcpType}
                        </SelectItem>
                      )}
                      <SelectItem value="Custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-3 w-3" /> Custom
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom MCP Type</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input 
                          placeholder="Enter custom MCP type..."
                          value={customMcp}
                          onChange={(e) => setCustomMcp(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" onClick={saveCustomMcp}>Add</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
            <label className="flex items-center gap-1 text-sm font-medium">
              <Code className="h-4 w-4" />
              Advanced Prompt Engineering Details
            </label>
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
