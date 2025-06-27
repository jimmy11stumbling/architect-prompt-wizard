
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
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT",
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
      authenticationMethod: "JWT",
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
      projectDescription: "Advanced project management platform with kanban boards, gantt charts, team collaboration, time tracking, and AI-powered insights.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "DnD Kit", "Date Picker"],
      customBackendTech: ["WebSockets", "Real-time Updates", "Notification System"],
      a2aIntegrationDetails: "Agents for task prioritization, deadline management, resource allocation, and team productivity analysis.",
      additionalFeatures: "Kanban boards, gantt charts, time tracking, team chat, file sharing, reporting, integrations",
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for project templates and best practices. MCP tools for third-party integrations and workflow automation.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT",
      deploymentPreference: "Netlify",
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
      projectDescription: "Real-time messaging application with group chats, file sharing, voice/video calls, AI moderation, and end-to-end encryption.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "MongoDB", "Redis"],
      customFrontendTech: ["TailwindCSS", "Socket.io Client", "WebRTC"],
      customBackendTech: ["Socket.io", "WebRTC", "Encryption", "AI Moderation"],
      a2aIntegrationDetails: "Agents for content moderation, spam detection, smart notifications, and conversation insights.",
      additionalFeatures: "Real-time messaging, group chats, file sharing, voice/video calls, message encryption, AI moderation",
      ragVectorDb: "Milvus",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for conversation context and AI responses. MCP tools for moderation workflows and notification systems.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT",
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
      projectDescription: "Music streaming platform with playlist creation, AI-powered recommendations, social features, and artist analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Audio Player", "Waveform Visualizer"],
      customBackendTech: ["Audio Processing", "CDN", "Recommendation Engine"],
      a2aIntegrationDetails: "Agents for music recommendation, playlist generation, mood analysis, and user behavior prediction.",
      additionalFeatures: "Music player, playlists, recommendations, social sharing, artist profiles, analytics dashboard",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for music metadata and recommendations. MCP tools for audio processing and streaming optimization.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "photo-editor",
    name: "Photo Editing Suite",
    description: "AI-powered photo editing and enhancement",
    category: "Photo & Design",
    icon: <Camera className="h-5 w-5" />,
    tags: ["Photo", "AI Enhancement", "Filters"],
    spec: {
      projectDescription: "Professional photo editing application with AI enhancement, filters, batch processing, and cloud storage integration.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Canvas API", "WebGL", "Image Processing"],
      customBackendTech: ["Image AI APIs", "Cloud Storage", "Batch Processing"],
      a2aIntegrationDetails: "Agents for automatic enhancement, style transfer, object detection, and batch processing optimization.",
      additionalFeatures: "Photo editing tools, AI filters, batch processing, cloud storage, sharing, album management",
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for editing techniques and style guides. MCP tools for AI image processing and cloud integration.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "learning-platform",
    name: "Online Learning Platform",
    description: "Educational platform with AI tutoring",
    category: "Education",
    icon: <BookOpen className="h-5 w-5" />,
    tags: ["Education", "AI Tutor", "Progress Tracking"],
    spec: {
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
      authenticationMethod: "JWT"
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
      authenticationMethod: "JWT"
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
    id: "crm-system",
    name: "Customer Relationship Management",
    description: "AI-powered CRM with sales automation",
    category: "Business",
    icon: <Briefcase className="h-5 w-5" />,
    tags: ["CRM", "Sales", "AI Automation"],
    spec: {
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
      advancedPromptDetails: "RAG for customer insights and sales strategies. MCP tools for email automation and third-party integrations.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "car-rental",
    name: "Car Rental Platform",
    description: "Vehicle rental with smart booking system",
    category: "Transportation",
    icon: <Car className="h-5 w-5" />,
    tags: ["Car Rental", "Booking", "GPS"],
    spec: {
      projectDescription: "Car rental platform with vehicle search, booking system, GPS tracking, payment processing, and fleet management.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Map Integration", "Payment Forms"],
      customBackendTech: ["GPS Tracking", "Payment Processing", "Fleet Management"],
      a2aIntegrationDetails: "Agents for dynamic pricing, vehicle maintenance scheduling, route optimization, and customer service automation.",
      additionalFeatures: "Vehicle search, booking system, payment processing, GPS tracking, insurance options, customer reviews",
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for vehicle recommendations and pricing optimization. MCP integration with payment and GPS systems.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "real-estate",
    name: "Real Estate Platform",
    description: "Property marketplace with virtual tours",
    category: "Real Estate",
    icon: <Home className="h-5 w-5" />,
    tags: ["Real Estate", "Virtual Tours", "Marketplace"],
    spec: {
      projectDescription: "Real estate platform with property listings, virtual tours, mortgage calculator, agent matching, and market analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "360° Viewer", "Map Integration"],
      customBackendTech: ["Virtual Tour Engine", "Market Data APIs", "Mortgage APIs"],
      a2aIntegrationDetails: "Agents for property valuation, market analysis, customer matching, and automated lead generation.",
      additionalFeatures: "Property listings, virtual tours, mortgage calculator, agent profiles, market analytics, saved searches",
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for property recommendations and market insights. MCP tools for financial calculations and data integration.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop Management",
    description: "POS system with loyalty and ordering",
    category: "Food & Beverage",
    icon: <Coffee className="h-5 w-5" />,
    tags: ["POS", "Loyalty", "Ordering"],
    spec: {
      projectDescription: "Coffee shop management system with POS, online ordering, loyalty program, inventory management, and customer analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "POS Interface", "Mobile Ordering"],
      customBackendTech: ["Payment Processing", "Loyalty Engine", "Inventory Tracking"],
      a2aIntegrationDetails: "Agents for inventory optimization, customer preference analysis, loyalty rewards management, and sales forecasting.",
      additionalFeatures: "POS system, online ordering, loyalty program, inventory management, customer analytics, staff scheduling",
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for customer preferences and product recommendations. MCP integration with payment and inventory systems.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "travel-planner",
    name: "Travel Planning Assistant",
    description: "AI-powered trip planning and booking",
    category: "Travel",
    icon: <Plane className="h-5 w-5" />,
    tags: ["Travel", "AI Planning", "Booking"],
    spec: {
      projectDescription: "AI-powered travel planning platform with itinerary creation, booking integration, expense tracking, and travel recommendations.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Map Integration", "Calendar"],
      customBackendTech: ["Travel APIs", "AI Planning", "Booking Integration"],
      a2aIntegrationDetails: "Agents for itinerary optimization, budget management, activity recommendations, and real-time travel updates.",
      additionalFeatures: "Trip planning, booking integration, expense tracking, travel recommendations, offline maps, travel documents",
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for travel recommendations and local insights. MCP tools for booking APIs and travel data integration.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "restaurant-app",
    name: "Restaurant Management System",
    description: "Complete restaurant operations platform",
    category: "Restaurant",
    icon: <Utensils className="h-5 w-5" />,
    tags: ["Restaurant", "Orders", "Kitchen"],
    spec: {
      projectDescription: "Restaurant management system with online ordering, kitchen display, table management, staff coordination, and customer feedback.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL", "Redis"],
      customFrontendTech: ["TailwindCSS", "Kitchen Display", "Table Management"],
      customBackendTech: ["Order Management", "Real-time Updates", "Staff Scheduling"],
      a2aIntegrationDetails: "Agents for order optimization, kitchen workflow management, staff coordination, and customer service automation.",
      additionalFeatures: "Online ordering, kitchen display system, table management, staff scheduling, inventory tracking, customer reviews",
      ragVectorDb: "Milvus",
      customRagVectorDb: "",
      mcpType: "Extended MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for menu optimization and customer preferences. MCP tools for kitchen workflow and order management.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "telemedicine",
    name: "Telemedicine Platform",
    description: "Virtual healthcare consultations",
    category: "Healthcare",
    icon: <Stethoscope className="h-5 w-5" />,
    tags: ["Healthcare", "Telemedicine", "HIPAA"],
    spec: {
      projectDescription: "HIPAA-compliant telemedicine platform with video consultations, patient records, prescription management, and appointment scheduling.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Video Conferencing", "HIPAA Components"],
      customBackendTech: ["HIPAA Compliance", "Video SDK", "Medical Records"],
      a2aIntegrationDetails: "Agents for appointment scheduling, symptom analysis, prescription management, and patient follow-up automation.",
      additionalFeatures: "Video consultations, patient records, prescription management, appointment scheduling, secure messaging, billing",
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      advancedPromptDetails: "RAG for medical knowledge and patient history. MCP tools for healthcare integrations and compliance workflows.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "student-portal",
    name: "Student Information System",
    description: "Comprehensive school management platform",
    category: "Education Management",
    icon: <GraduationCap className="h-5 w-5" />,
    tags: ["Education", "Students", "Grades"],
    spec: {
      projectDescription: "Student information system with grade tracking, attendance management, course enrollment, parent communication, and academic analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Calendar", "Grade Charts"],
      customBackendTech: ["Academic Analytics", "Communication System", "Report Generation"],
      a2aIntegrationDetails: "Agents for academic performance analysis, attendance monitoring, parent communication automation, and course recommendations.",
      additionalFeatures: "Grade tracking, attendance management, course enrollment, parent portal, academic reports, communication tools",
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      advancedPromptDetails: "RAG for academic insights and student support. MCP integration with educational tools and communication systems.",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    }
  },
  {
    id: "expense-tracker",
    name: "Personal Finance Manager",
    description: "AI-powered expense tracking and budgeting",
    category: "Finance",
    icon: <DollarSign className="h-5 w-5" />,
    tags: ["Finance", "Budgeting", "AI Insights"],
    spec: {
      projectDescription: "Personal finance management app with expense tracking, budget planning, investment monitoring, AI insights, and financial goal setting.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["FastAPI", "PostgreSQL"],
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
      authenticationMethod: "JWT",
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
