
import React from "react";
import { TechStackSelector } from "./";
import { TechStack } from "@/types/ipa-types";

const FRONTEND_OPTIONS: TechStack[] = [
  "React", 
  "Next.js", 
  "Vue", 
  "Angular", 
  "Svelte", 
  "Nuxt.js", 
  "Gatsby", 
  "Remix"
];

const BACKEND_OPTIONS: TechStack[] = [
  "Express", 
  "NestJS", 
  "FastAPI", 
  "Django", 
  "Flask", 
  "Spring Boot", 
  "Laravel", 
  "Ruby on Rails",
  "ASP.NET Core",
  "Koa.js",
  "Hapi.js"
];

const DATABASE_OPTIONS: TechStack[] = [
  "PostgreSQL", 
  "MongoDB", 
  "Redis", 
  "MySQL", 
  "SQLite", 
  "Supabase", 
  "Firebase", 
  "DynamoDB",
  "CouchDB",
  "Cassandra"
];

const ADDITIONAL_OPTIONS: TechStack[] = [
  "Docker", 
  "Kubernetes", 
  "GraphQL", 
  "REST API", 
  "WebSockets", 
  "Microservices",
  "Serverless",
  "AWS",
  "Google Cloud",
  "Azure"
];

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
  onRemoveCustomTech,
}) => {
  return (
    <div className="space-y-6">
      <TechStackSelector
        title="Frontend Tech Stack"
        options={FRONTEND_OPTIONS}
        selectedTechs={frontendTechStack}
        customTechs={customFrontendTech}
        onToggleTech={(tech) => onTechStackToggle(tech, "frontend")}
        onAddCustomTech={(tech) => onAddCustomTech(tech, "frontend")}
        onRemoveCustomTech={(tech) => onRemoveCustomTech(tech, "frontend")}
        bgColorClass="bg-ipa-primary"
      />

      <TechStackSelector
        title="Backend Tech Stack"
        options={BACKEND_OPTIONS}
        selectedTechs={backendTechStack}
        customTechs={customBackendTech}
        onToggleTech={(tech) => onTechStackToggle(tech, "backend")}
        onAddCustomTech={(tech) => onAddCustomTech(tech, "backend")}
        onRemoveCustomTech={(tech) => onRemoveCustomTech(tech, "backend")}
        bgColorClass="bg-ipa-secondary"
      />

      <TechStackSelector
        title="Database & Infrastructure"
        options={[...DATABASE_OPTIONS, ...ADDITIONAL_OPTIONS]}
        selectedTechs={backendTechStack}
        customTechs={customBackendTech}
        onToggleTech={(tech) => onTechStackToggle(tech, "backend")}
        onAddCustomTech={(tech) => onAddCustomTech(tech, "backend")}
        onRemoveCustomTech={(tech) => onRemoveCustomTech(tech, "backend")}
        bgColorClass="bg-ipa-accent"
      />
    </div>
  );
};

export default TechStackSection;
