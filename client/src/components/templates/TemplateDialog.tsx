import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Video, Palette, Dumbbell, ShoppingCart, Calendar, MessageSquare, Music, Camera, BookOpen, Heart, Gamepad2, Briefcase, Car, Home, Coffee, Plane, Utensils, Stethoscope, GraduationCap, DollarSign } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  spec: ProjectSpec;
  tags: string[];
}

const templates: Template[] = [
  {
    id: "video-editor",
    name: "Video Editor Platform",
    description: "Professional video editing with collaboration features",
    category: "Video Creation",
    icon: <Video className="h-5 w-5" />,
    tags: ["Video", "Editing", "Collaboration"],
    spec: {
      projectDescription: "A professional video editing platform with real-time collaboration, timeline editing, effects library, and export capabilities for content creators.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Framer Motion", "WebGL"],
      customBackendTech: ["FFmpeg", "WebRTC", "AWS S3"],
      a2aIntegrationDetails: "Agent communication for video processing tasks, collaborative editing sessions, and real-time notifications.",
      additionalFeatures: "Timeline editor, effects library, collaborative editing, video processing, export queue, user management, project sharing",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "Implement semantic search for video assets, RAG for editing suggestions, and MCP tools for video processing workflows.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "content-creator-hub",
    name: "Content Creator Hub",
    description: "All-in-one platform for content planning and publishing",
    category: "Content Creation",
    icon: <Palette className="h-5 w-5" />,
    tags: ["Content", "Social Media", "Publishing"],
    spec: {
      projectDescription: "Comprehensive content creation platform with scheduling, analytics, multi-platform publishing, and AI-powered content suggestions.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "MongoDB"],
      customFrontendTech: ["TailwindCSS", "ShadCN UI", "React Hook Form"],
      customBackendTech: ["Social Media APIs", "Analytics SDK", "Image Processing"],
      a2aIntegrationDetails: "Agents for content optimization, scheduling automation, and cross-platform publishing coordination.",
      additionalFeatures: "Content calendar, analytics dashboard, multi-platform posting, AI content suggestions, team collaboration",
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "Use RAG for content inspiration and trending topics analysis. MCP integration with social media platforms and analytics tools.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "fitness-tracker",
    name: "Fitness & Workout Tracker",
    description: "Comprehensive fitness tracking with AI personal trainer",
    category: "Fitness & Health",
    icon: <Dumbbell className="h-5 w-5" />,
    tags: ["Fitness", "Health", "AI Trainer"],
    spec: {
      projectDescription: "Advanced fitness tracking app with workout planning, nutrition tracking, AI personal trainer, and social features for motivation.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Chart.js", "Progressive Web App"],
      customBackendTech: ["Machine Learning", "Health APIs", "Wearable Integration"],
      a2aIntegrationDetails: "AI agents for personalized workout recommendations, nutrition analysis, and progress tracking with real-time adjustments.",
      additionalFeatures: "Workout library, nutrition tracking, progress analytics, social challenges, wearable integration, AI coaching",
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for exercise database and nutrition information. MCP tools for health data integration and AI coaching workflows.",
      deploymentPreference: "Netlify",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "ecommerce-store",
    name: "E-commerce Store",
    description: "Modern e-commerce platform with AI recommendations",
    category: "E-commerce",
    icon: <ShoppingCart className="h-5 w-5" />,
    tags: ["E-commerce", "AI", "Payments"],
    spec: {
      projectDescription: "Full-featured e-commerce platform with product catalog, shopping cart, payment processing, AI recommendations, and admin dashboard.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Stripe Components", "Image Optimization"],
      customBackendTech: ["Stripe API", "Payment Processing", "Inventory Management"],
      a2aIntegrationDetails: "Agents for inventory management, price optimization, customer service automation, and personalized recommendations.",
      additionalFeatures: "Product catalog, shopping cart, payment processing, order management, inventory tracking, analytics, customer reviews",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for product recommendations and customer support. MCP integration with payment systems and inventory management tools.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "task-manager",
    name: "Project Management Tool",
    description: "Collaborative project management with AI insights",
    category: "Productivity",
    icon: <Calendar className="h-5 w-5" />,
    tags: ["Productivity", "Collaboration", "AI"],
    spec: {
      projectDescription: "Comprehensive project management tool with kanban boards, gantt charts, time tracking, team collaboration, and AI-powered insights.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Drag & Drop", "Charts"],
      customBackendTech: ["Real-time Sync", "AI Analytics", "File Storage"],
      a2aIntegrationDetails: "Agents for task prioritization, deadline management, resource allocation, and team productivity analysis.",
      additionalFeatures: "Kanban boards, gantt charts, time tracking, team chat, file sharing, reporting, integrations",
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for project templates and best practices. MCP tools for third-party integrations and workflow automation.",
      deploymentPreference: "Netlify",
      authenticationMethod: "JWT"
    }
  }
];

interface TemplateDialogProps {
  onSelectTemplate: (spec: ProjectSpec) => void;
  children: React.ReactNode;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({ onSelectTemplate, children }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  
  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === "All" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-ipa-accent" />
            Quick Templates
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {template.icon}
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onSelectTemplate(template.spec)}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;