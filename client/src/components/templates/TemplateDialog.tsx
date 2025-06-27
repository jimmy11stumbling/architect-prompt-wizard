import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Video, Palette, Dumbbell, ShoppingCart, Calendar, MessageSquare, Music, Camera, BookOpen, Heart, Gamepad2, Briefcase, Car, Home, Coffee, Plane, Utensils, Stethoscope, GraduationCap, DollarSign } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";
import TemplateViewer from "./TemplateViewer";
import OneClickCopy from "./OneClickCopy";
import CopyFormats from "./CopyFormats";

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
      targetPlatform: "bolt" as const,
      platformSpecificConfig: {
        supportedFeatures: ["Real-time collaboration", "Video processing", "Timeline editing"],
        preferredTechStack: ["React", "Next.js", "NestJS"],
        deploymentOptions: ["AWS", "Vercel"],
        limitations: ["Large file uploads", "Real-time sync"],
        bestPractices: ["Component splitting", "State management"],
        promptStyle: "code-focused",
        contextPreferences: ["Performance optimization", "Real-time features"],
        outputFormat: "step-by-step"
      },
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
    id: "chat-app",
    name: "Real-time Chat Application",
    description: "Modern messaging app with AI moderation",
    category: "Communication",
    icon: <MessageSquare className="h-5 w-5" />,
    tags: ["Chat", "Real-time", "AI Moderation"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["Real-time Communication", "AI Integration"],
        preferredTechStack: ["React", "Express"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["WebSocket optimization", "AI moderation"],
        promptStyle: "conversational",
        contextPreferences: ["real-time", "messaging"],
        outputFormat: "detailed"
      },
      projectDescription: "Real-time messaging application with group chats, file sharing, voice/video calls, AI moderation, and end-to-end encryption.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "MongoDB", "Redis"],
      customFrontendTech: ["TailwindCSS", "Socket.io Client", "WebRTC"],
      customBackendTech: ["Socket.io", "AI Moderation", "File Upload"],
      a2aIntegrationDetails: "Agents for content moderation, conversation analysis, and automated customer support responses.",
      additionalFeatures: "Real-time messaging, group chats, file sharing, voice/video calls, message encryption, AI moderation",
      ragVectorDb: "Milvus",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for conversation context and AI responses. MCP tools for moderation workflows and notification systems.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "music-streaming",
    name: "Music Streaming Platform",
    description: "Spotify-like music streaming with AI playlists",
    category: "Entertainment",
    icon: <Music className="h-5 w-5" />,
    tags: ["Music", "Streaming", "AI Playlists"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["Music Streaming", "AI Recommendations"],
        preferredTechStack: ["React", "NestJS"],
        deploymentOptions: ["Vercel", "AWS"],
        limitations: [],
        bestPractices: ["Audio optimization", "CDN usage"],
        promptStyle: "conversational",
        contextPreferences: ["music", "entertainment"],
        outputFormat: "detailed"
      },
      projectDescription: "Music streaming platform with personalized playlists, social features, artist profiles, and AI-powered music recommendations.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Audio Player", "Waveform"],
      customBackendTech: ["Music APIs", "AI Recommendations", "CDN"],
      a2aIntegrationDetails: "Agents for music recommendation, playlist generation, and user behavior analysis for personalized experiences.",
      additionalFeatures: "Music player, playlists, social sharing, artist profiles, lyrics, offline mode, premium subscriptions",
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for music metadata and recommendations. MCP tools for music streaming APIs and analytics integration.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "photo-editor",
    name: "Photo Editing Suite",
    description: "Comprehensive photo editing and enhancement",
    category: "Photo & Design",
    icon: <Camera className="h-5 w-5" />,
    tags: ["Photo", "AI Enhancement", "Filters"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Advanced photo editing suite with AI enhancement, filters, batch processing, and cloud storage integration.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Canvas API", "WebGL"],
      customBackendTech: ["Image Processing", "AI Enhancement", "Cloud Storage"],
      a2aIntegrationDetails: "Agents for automated photo enhancement, batch processing workflows, and intelligent tagging systems.",
      additionalFeatures: "Photo filters, AI enhancement, batch processing, cloud sync, sharing, templates, RAW support",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for photo editing techniques and styles. MCP tools for image processing and cloud storage integration.",
      deploymentPreference: "Netlify",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "online-learning",
    name: "Online Learning Platform",
    description: "Educational platform with AI tutoring",
    category: "Education",
    icon: <BookOpen className="h-5 w-5" />,
    tags: ["Education", "AI Tutor", "Progress Tracking"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Comprehensive online learning platform with courses, quizzes, AI tutoring, progress tracking, and certification system.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Video Player", "Quiz Components"],
      customBackendTech: ["Video Streaming", "AI Tutoring", "Analytics"],
      a2aIntegrationDetails: "Agents for personalized learning paths, automated grading, progress analysis, and adaptive content delivery.",
      additionalFeatures: "Course catalog, video lessons, quizzes, certificates, progress tracking, discussion forums, AI tutoring",
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for educational content and personalized tutoring. MCP tools for learning analytics and adaptive testing.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "dating-app",
    name: "Dating & Social App",
    description: "Modern dating app with AI matchmaking",
    category: "Social",
    icon: <Heart className="h-5 w-5" />,
    tags: ["Dating", "AI Matching", "Social"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Dating application with AI-powered matchmaking, profile verification, chat features, and safety-focused design.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "MongoDB"],
      customFrontendTech: ["TailwindCSS", "Swipe Components", "Geolocation"],
      customBackendTech: ["AI Matching", "Image Verification", "Real-time Chat"],
      a2aIntegrationDetails: "Agents for compatibility analysis, safety monitoring, conversation starters, and behavioral pattern recognition.",
      additionalFeatures: "Profile creation, matching algorithm, chat system, video calls, safety features, premium subscriptions",
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for personality matching and conversation analysis. MCP tools for safety monitoring and user verification.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "gaming-platform",
    name: "Gaming Community Platform",
    description: "Social platform for gamers with tournaments",
    category: "Gaming",
    icon: <Gamepad2 className="h-5 w-5" />,
    tags: ["Gaming", "Community", "Tournaments"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Gaming community platform with tournament organization, leaderboards, team formation, and live streaming integration.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Live Chat", "Video Streaming"],
      customBackendTech: ["Tournament Engine", "Live Streaming", "Game APIs"],
      a2aIntegrationDetails: "Agents for tournament matchmaking, skill assessment, team recommendations, and streaming optimization.",
      additionalFeatures: "Tournament system, leaderboards, team formation, live streaming, gaming profiles, achievement tracking",
      ragVectorDb: "Milvus",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for game strategies and player analytics. MCP tools for tournament management and streaming integration.",
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
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
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
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
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
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
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
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
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
  },
  {
    id: "crm-system",
    name: "Customer Relationship Management",
    description: "AI-powered CRM with sales automation",
    category: "Business",
    icon: <Briefcase className="h-5 w-5" />,
    tags: ["CRM", "Sales", "AI Automation"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Comprehensive CRM system with contact management, sales pipeline, AI-powered insights, and automation workflows.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Charts", "Kanban"],
      customBackendTech: ["Email Integration", "AI Analytics", "Workflow Automation"],
      a2aIntegrationDetails: "Agents for lead scoring, sales forecasting, automated follow-ups, and customer behavior analysis.",
      additionalFeatures: "Contact management, sales pipeline, email integration, reporting, automation workflows, team collaboration",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for sales insights and customer data analysis. MCP tools for CRM integrations and workflow automation.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    }
  },
  {
    id: "financial-tracker",
    name: "Personal Finance Manager",
    description: "Comprehensive financial tracking with AI insights",
    category: "Finance",
    icon: <DollarSign className="h-5 w-5" />,
    tags: ["Finance", "Budget", "AI Insights"],
    spec: {
      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },
      projectDescription: "Personal finance management app with expense tracking, budget planning, investment monitoring, and AI-powered financial insights.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Charts", "Financial Widgets"],
      customBackendTech: ["Bank APIs", "AI Analytics", "Investment APIs"],
      a2aIntegrationDetails: "Agents for spending analysis, budget optimization, investment recommendations, and financial goal tracking.",
      additionalFeatures: "Expense tracking, budget planning, investment monitoring, financial insights, goal setting, bill reminders",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for financial advice and market insights. MCP tools for banking integration and financial data analysis.",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
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
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => onSelectTemplate(template.spec)}
                    >
                      Use This Template
                    </Button>
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <OneClickCopy 
                          template={template}
                          className="flex-1"
                        />
                        <TemplateViewer 
                          template={template} 
                          onSelectTemplate={onSelectTemplate}
                        />
                      </div>
                      <CopyFormats template={template} />
                    </div>
                  </div>
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