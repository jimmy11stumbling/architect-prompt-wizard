
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Star, 
  Download, 
  Eye, 
  Code, 
  Smartphone, 
  Globe, 
  Database,
  Zap,
  Layers,
  Filter,
  Plus,
  Heart,
  Users,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: "ecommerce" | "saas" | "mobile" | "enterprise" | "ai" | "web3" | "social" | "productivity";
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    ai: string[];
  };
  preview: {
    images: string[];
    features: string[];
    architecture: string;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    lastUpdated: string;
  };
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  template: {
    projectDescription: string;
    frontendTech: string[];
    backendTech: string[];
    additionalFeatures: string;
    ragVectorDb: string;
    mcpType: string;
    a2aIntegration: string;
  };
}

const AdvancedTemplateSystem: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with comprehensive template library
    const mockTemplates: ProjectTemplate[] = [
      {
        id: "ecom_001",
        name: "AI-Powered E-commerce Platform",
        description: "Complete e-commerce solution with AI recommendations, inventory management, and analytics",
        category: "ecommerce",
        difficulty: "advanced",
        tags: ["react", "nodejs", "ai", "stripe", "analytics"],
        techStack: {
          frontend: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
          backend: ["Node.js", "Express", "MongoDB", "Redis"],
          database: ["MongoDB", "PostgreSQL", "Redis"],
          ai: ["OpenAI", "RAG 2.0", "Recommendation Engine"]
        },
        preview: {
          images: ["/placeholder.svg"],
          features: [
            "AI-powered product recommendations",
            "Real-time inventory management",
            "Advanced analytics dashboard",
            "Multi-payment gateway integration",
            "Customer behavior tracking"
          ],
          architecture: "Microservices with AI integration"
        },
        stats: {
          downloads: 1247,
          rating: 4.8,
          reviews: 89,
          lastUpdated: "2024-01-15"
        },
        author: {
          name: "NoCodeLos Team",
          avatar: "/lovable-uploads/0b601e77-6a17-4bff-ab47-fcf8bdb6e879.png",
          verified: true
        },
        template: {
          projectDescription: "Build a complete AI-powered e-commerce platform with advanced product recommendations, inventory management, customer analytics, and multi-payment gateway integration. Features include real-time inventory tracking, AI-driven product suggestions, comprehensive admin dashboard, and customer behavior analysis.",
          frontendTech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
          backendTech: ["Node.js", "Express", "MongoDB", "Redis"],
          additionalFeatures: "AI recommendations, Real-time inventory, Analytics dashboard, Multi-payment gateways, Customer tracking, SEO optimization, Mobile-responsive design",
          ragVectorDb: "Pinecone",
          mcpType: "Database + API",
          a2aIntegration: "Product recommendation agents, Inventory management agents, Analytics processing agents"
        }
      },
      {
        id: "saas_001",
        name: "Multi-Tenant SaaS Starter",
        description: "Scalable SaaS platform with multi-tenancy, billing, and team management",
        category: "saas",
        difficulty: "advanced",
        tags: ["saas", "multi-tenant", "billing", "teams", "auth"],
        techStack: {
          frontend: ["React", "TypeScript", "Shadcn/UI", "React Query"],
          backend: ["Node.js", "Express", "PostgreSQL", "Stripe"],
          database: ["PostgreSQL", "Redis"],
          ai: ["OpenAI", "A2A Protocol"]
        },
        preview: {
          images: ["/placeholder.svg"],
          features: [
            "Multi-tenant architecture",
            "Subscription billing with Stripe",
            "Team management & roles",
            "API rate limiting",
            "Advanced analytics"
          ],
          architecture: "Multi-tenant with row-level security"
        },
        stats: {
          downloads: 892,
          rating: 4.7,
          reviews: 56,
          lastUpdated: "2024-01-12"
        },
        author: {
          name: "SaaS Experts",
          avatar: "/placeholder.svg",
          verified: true
        },
        template: {
          projectDescription: "Create a comprehensive multi-tenant SaaS platform with subscription billing, team management, role-based access control, API rate limiting, and advanced analytics. Includes tenant isolation, billing integration, user management, and scalable architecture.",
          frontendTech: ["React", "TypeScript", "Shadcn/UI", "React Query"],
          backendTech: ["Node.js", "Express", "PostgreSQL", "Stripe API"],
          additionalFeatures: "Multi-tenancy, Subscription billing, Team roles, API limits, Analytics, Tenant isolation, Billing webhooks, Usage tracking",
          ragVectorDb: "Chroma",
          mcpType: "Database + Stripe",
          a2aIntegration: "Billing agents, Analytics agents, Notification agents"
        }
      },
      {
        id: "mobile_001",
        name: "Cross-Platform Mobile App",
        description: "React Native app with offline support, push notifications, and AI features",
        category: "mobile",
        difficulty: "intermediate",
        tags: ["react-native", "mobile", "offline", "push", "ai"],
        techStack: {
          frontend: ["React Native", "TypeScript", "Expo"],
          backend: ["Node.js", "Express", "Firebase"],
          database: ["Firebase", "SQLite"],
          ai: ["TensorFlow Lite", "On-device AI"]
        },
        preview: {
          images: ["/placeholder.svg"],
          features: [
            "Cross-platform compatibility",
            "Offline data synchronization",
            "Push notifications",
            "On-device AI features",
            "Biometric authentication"
          ],
          architecture: "Mobile-first with offline capabilities"
        },
        stats: {
          downloads: 634,
          rating: 4.6,
          reviews: 42,
          lastUpdated: "2024-01-10"
        },
        author: {
          name: "Mobile Innovators",
          avatar: "/placeholder.svg",
          verified: false
        },
        template: {
          projectDescription: "Develop a cross-platform mobile application with offline data synchronization, push notifications, biometric authentication, and on-device AI capabilities. Features include real-time sync, background processing, and native performance.",
          frontendTech: ["React Native", "TypeScript", "Expo"],
          backendTech: ["Node.js", "Express", "Firebase"],
          additionalFeatures: "Offline sync, Push notifications, Biometric auth, On-device AI, Background processing, Native modules",
          ragVectorDb: "Local Vector DB",
          mcpType: "Firebase + Native",
          a2aIntegration: "Sync agents, Notification agents, AI processing agents"
        }
      },
      {
        id: "ai_001",
        name: "AI Agent Marketplace",
        description: "Platform for creating, sharing, and monetizing AI agents",
        category: "ai",
        difficulty: "advanced",
        tags: ["ai", "agents", "marketplace", "monetization"],
        techStack: {
          frontend: ["React", "TypeScript", "Tailwind CSS"],
          backend: ["Python", "FastAPI", "Celery"],
          database: ["PostgreSQL", "Vector DB"],
          ai: ["OpenAI", "Hugging Face", "Custom Models"]
        },
        preview: {
          images: ["/placeholder.svg"],
          features: [
            "AI agent creation studio",
            "Marketplace for agents",
            "Revenue sharing system",
            "Agent performance analytics",
            "Community features"
          ],
          architecture: "Microservices with AI orchestration"
        },
        stats: {
          downloads: 445,
          rating: 4.9,
          reviews: 78,
          lastUpdated: "2024-01-14"
        },
        author: {
          name: "AI Builders",
          avatar: "/placeholder.svg",
          verified: true
        },
        template: {
          projectDescription: "Build an AI agent marketplace where users can create, share, and monetize custom AI agents. Features include agent creation studio, marketplace, revenue sharing, performance analytics, and community features.",
          frontendTech: ["React", "TypeScript", "Tailwind CSS"],
          backendTech: ["Python", "FastAPI", "Celery"],
          additionalFeatures: "Agent studio, Marketplace, Revenue sharing, Analytics, Community, Model hosting, API management",
          ragVectorDb: "Pinecone",
          mcpType: "Custom AI Tools",
          a2aIntegration: "Agent coordination, Marketplace agents, Analytics agents"
        }
      }
    ];

    setTemplates(mockTemplates);
    setFilteredTemplates(mockTemplates);
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedDifficulty]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ecommerce": return <Globe className="h-4 w-4" />;
      case "saas": return <Layers className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "ai": return <Zap className="h-4 w-4" />;
      case "enterprise": return <Database className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-300 border-green-400/30";
      case "intermediate": return "text-yellow-300 border-yellow-400/30";
      case "advanced": return "text-red-300 border-red-400/30";
      default: return "text-slate-300 border-slate-400/30";
    }
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Template Library</h1>
          <p className="text-slate-400 mt-1">Production-ready project templates for rapid development</p>
        </div>
        <Button className="btn-nocodelos">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-nocodelos">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS</option>
                <option value="mobile">Mobile</option>
                <option value="ai">AI/ML</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-nocodelos h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.includes(template.id) 
                          ? 'fill-red-400 text-red-400' 
                          : 'text-slate-400'
                      }`} 
                    />
                  </Button>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{template.stats.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {template.stats.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.stats.lastUpdated}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-slate-300">{template.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2">Key Features</h3>
                          <ul className="space-y-1">
                            {template.preview.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Tech Stack</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-slate-300">Frontend</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {template.techStack.frontend.map(tech => (
                                  <Badge key={tech} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-slate-300">Backend</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {template.techStack.backend.map(tech => (
                                  <Badge key={tech} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    className="flex-1 btn-nocodelos"
                    onClick={() => {
                      // Here you would integrate with your existing project creation flow
                      console.log("Using template:", template.template);
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">No templates found matching your criteria</div>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSelectedDifficulty("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedTemplateSystem;
