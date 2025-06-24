
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { TechStack } from "@/types/ipa-types";

interface TechStackSectionProps {
  frontendTechStack: TechStack[];
  backendTechStack: TechStack[];
  customFrontendTech: string[];
  customBackendTech: string[];
  onTechStackToggle: (tech: TechStack, type: "frontend" | "backend") => void;
  onAddCustomTech: (tech: string, type: "frontend" | "backend") => void;
  onRemoveCustomTech: (tech: string, type: "frontend" | "backend") => void;
}

const TechStackSection: React.FC<TechStackSectionProps> = ({
  frontendTechStack,
  backendTechStack,
  customFrontendTech,
  customBackendTech,
  onTechStackToggle,
  onAddCustomTech,
  onRemoveCustomTech
}) => {
  const [newFrontendTech, setNewFrontendTech] = useState("");
  const [newBackendTech, setNewBackendTech] = useState("");

  const frontendOptions: TechStack[] = ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js"];
  const backendOptions: TechStack[] = ["Express", "FastAPI", "Django", "Spring", "Flask", "NestJS", "PostgreSQL", "MongoDB", "MySQL"];

  const handleAddFrontend = () => {
    if (newFrontendTech.trim()) {
      onAddCustomTech(newFrontendTech.trim(), "frontend");
      setNewFrontendTech("");
    }
  };

  const handleAddBackend = () => {
    if (newBackendTech.trim()) {
      onAddCustomTech(newBackendTech.trim(), "backend");
      setNewBackendTech("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Frontend Tech Stack */}
      <div className="space-y-3">
        <Label>Frontend Technologies *</Label>
        <div className="flex flex-wrap gap-2">
          {frontendOptions.map((tech) => (
            <Badge
              key={tech}
              variant={frontendTechStack.includes(tech) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => onTechStackToggle(tech, "frontend")}
            >
              {tech}
            </Badge>
          ))}
        </div>
        
        {/* Custom Frontend Tech */}
        {customFrontendTech.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customFrontendTech.map((tech) => (
              <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                {tech}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onRemoveCustomTech(tech, "frontend")}
                />
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Add custom frontend technology"
            value={newFrontendTech}
            onChange={(e) => setNewFrontendTech(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddFrontend()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddFrontend}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Backend Tech Stack */}
      <div className="space-y-3">
        <Label>Backend Technologies *</Label>
        <div className="flex flex-wrap gap-2">
          {backendOptions.map((tech) => (
            <Badge
              key={tech}
              variant={backendTechStack.includes(tech) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => onTechStackToggle(tech, "backend")}
            >
              {tech}
            </Badge>
          ))}
        </div>
        
        {/* Custom Backend Tech */}
        {customBackendTech.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customBackendTech.map((tech) => (
              <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                {tech}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onRemoveCustomTech(tech, "backend")}
                />
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Add custom backend technology"
            value={newBackendTech}
            onChange={(e) => setNewBackendTech(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddBackend()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddBackend}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechStackSection;
