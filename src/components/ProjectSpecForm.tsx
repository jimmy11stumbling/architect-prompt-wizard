
import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSpec, TechStack } from "@/types/ipa-types";

interface ProjectSpecFormProps {
  onSubmit: (spec: ProjectSpec) => void;
}

const FRONTEND_OPTIONS: TechStack[] = ["React", "Next.js", "Vue", "Angular"];
const BACKEND_OPTIONS: TechStack[] = ["Express", "NestJS", "FastAPI", "Django"];
const DATABASE_OPTIONS: TechStack[] = ["PostgreSQL", "MongoDB", "Redis"];
const ADDITIONAL_OPTIONS: TechStack[] = ["Docker"];

const ProjectSpecForm: React.FC<ProjectSpecFormProps> = ({ onSubmit }) => {
  const [spec, setSpec] = useState<ProjectSpec>({
    projectDescription: "",
    frontendTechStack: ["React"],
    backendTechStack: ["Express"],
    a2aIntegrationDetails: "",
    additionalFeatures: "",
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
    // Example quick fill for demo purposes
    setSpec({
      projectDescription: "A collaborative task management app with real-time updates and A2A communication.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      a2aIntegrationDetails: "Implement agent-to-agent communication for task assignment and notification subsystems.",
      additionalFeatures: "User authentication, role-based permissions, kanban board view, activity timeline, and email notifications.",
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">A2A Integration Details</label>
            <Textarea 
              placeholder="Describe how Agent-to-Agent communication should be implemented..."
              className="min-h-[80px]"
              value={spec.a2aIntegrationDetails}
              onChange={(e) => setSpec({ ...spec, a2aIntegrationDetails: e.target.value })}
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
