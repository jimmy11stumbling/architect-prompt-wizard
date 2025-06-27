
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";
import { toast } from "@/hooks/use-toast";

interface QuickFillButtonProps {
  onQuickFill: (spec: ProjectSpec) => void;
}

const QuickFillButton: React.FC<QuickFillButtonProps> = ({ onQuickFill }) => {
  const templates: Record<string, ProjectSpec> = {
    "E-commerce Platform": {
      projectDescription: "A comprehensive e-commerce platform with AI-powered product recommendations, real-time inventory management, and seamless payment processing. Features include user authentication, advanced product catalog with search and filtering, intelligent shopping cart with saved items, comprehensive order management system, and admin dashboard with detailed analytics and reporting. The platform will support multiple payment methods, automated email notifications, customer reviews and ratings, wishlist functionality, and mobile-responsive design for optimal user experience across all devices.",
      frontendTechStack: ["React", "Next.js", "TypeScript"],
      backendTechStack: ["Express", "PostgreSQL", "Node.js"],
      customFrontendTech: ["TailwindCSS", "Stripe Components", "React Hook Form", "React Query", "Framer Motion"],
      customBackendTech: ["Stripe API", "Redis", "JWT Auth", "Nodemailer", "Express Rate Limit"],
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Enhanced MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Implement comprehensive agent communication system: Product Catalog Agent coordinates with Inventory Management Agent for real-time stock updates. AI Recommendation Engine Agent communicates with User Behavior Tracking Agent to provide personalized product suggestions. Order Processing Agent coordinates seamlessly with Payment Processing Agent and Shipping Notification Agent. Customer Service Agent integrates with Knowledge Base Agent for automated support responses. Analytics Agent communicates with Sales Reporting Agent for business intelligence insights.",
      advancedPromptDetails: "Utilize context-aware prompting for intelligent product recommendations based on comprehensive user browsing history, purchase patterns, and demographic data. Implement advanced RAG 2.0 for dynamic product information retrieval and automated customer service with natural language processing. Include persistent conversation memory for personalized shopping experiences, seasonal recommendation adjustments, and predictive inventory management based on user behavior patterns.",
      additionalFeatures: "Multi-gateway payment integration (Stripe, PayPal, Apple Pay), automated email and SMS notifications, comprehensive analytics dashboard with real-time reporting, full mobile responsiveness with PWA capabilities, advanced product reviews and ratings system with moderation, sophisticated wishlist and favorites functionality, inventory alerts and restock notifications, multi-currency and multi-language support, advanced search with filters and AI-powered suggestions, customer loyalty program integration, abandoned cart recovery system, and comprehensive admin panel with user management",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    },
    "AI Chat Application": {
      projectDescription: "An advanced AI-powered chat application featuring multi-agent conversation support, intelligent document analysis, and real-time collaboration capabilities. The platform includes sophisticated AI-powered response generation, seamless file sharing with automatic processing, comprehensive conversation management with search and categorization, and advanced natural language processing capabilities. Users can engage in contextual conversations, upload and analyze documents, collaborate in real-time with team members, and leverage AI assistance for complex problem-solving tasks.",
      frontendTechStack: ["React", "Vue", "TypeScript"],
      backendTechStack: ["FastAPI", "MongoDB", "Python"],
      customFrontendTech: ["Socket.io Client", "React Query", "Framer Motion", "React Dropzone", "React Markdown"],
      customBackendTech: ["Socket.io", "WebRTC", "AI APIs", "OpenAI API", "Document Processing", "WebSocket Manager"],
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "Enterprise MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Advanced multi-agent orchestration: Conversation Moderator Agent coordinates with Response Generation Agent for contextually appropriate AI responses. Document Processing Agent communicates with Content Analysis Agent for intelligent file analysis and summarization. Real-time Message Routing Agent manages communication between AI agents for seamless conversation flow. Knowledge Retrieval Agent integrates with Context Management Agent for accurate information retrieval. Translation Agent coordinates with Language Detection Agent for multi-language support.",
      advancedPromptDetails: "Implement sophisticated context-aware conversation management with persistent memory of previous interactions across sessions. Advanced document summarization and analysis using RAG 2.0 for uploaded files with intelligent content extraction. Dynamic response generation with personality adaptation, conversation style matching, and emotional intelligence. Include multi-turn conversation handling, topic detection and management, and intelligent conversation threading for complex discussions.",
      additionalFeatures: "Advanced file upload and sharing with automatic processing and analysis, real-time messaging with typing indicators and read receipts, comprehensive conversation history with search and filtering, user presence indicators and status management, voice message recording and playback, end-to-end message encryption, sophisticated group chat management, emoji reactions and message threading, AI-powered conversation insights and analytics, customizable chat themes and layouts, integration with external services and APIs, mobile push notifications, and offline message synchronization",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    },
    "Data Analytics Dashboard": {
      projectDescription: "A comprehensive data analytics and business intelligence platform featuring AI-driven insights, real-time data visualization, and automated reporting capabilities. The dashboard provides interactive charts and graphs, comprehensive KPI tracking with customizable metrics, predictive analytics with machine learning models, and fully customizable dashboard layouts for optimal business intelligence. Users can create custom reports, set up automated alerts, perform complex data analysis, and gain actionable insights from their business data through intuitive visualizations and AI-powered recommendations.",
      frontendTechStack: ["React", "Angular", "TypeScript"],
      backendTechStack: ["Django", "PostgreSQL", "Python"],
      customFrontendTech: ["D3.js", "Chart.js", "React Grid Layout", "React Table", "Recharts", "Victory Charts"],
      customBackendTech: ["Pandas", "NumPy", "Celery", "Redis", "Data Pipeline", "ML Models"],
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Sophisticated data processing architecture: Data Ingestion Agent coordinates with Data Validation Agent for quality assurance. Analytics Computation Agent communicates with Predictive Modeling Agent for advanced forecasting. Report Generation Agent works with Data Visualization Agent for automated chart and graph creation. Anomaly Detection Agent integrates with Alert Management Agent for proactive monitoring. Business Intelligence Agent coordinates with Trend Analysis Agent for strategic insights.",
      advancedPromptDetails: "Advanced data interpretation with natural language query processing for intuitive data exploration. Automated insight generation using RAG 2.0 for comprehensive business knowledge base integration. Smart anomaly detection with contextual explanations and recommended actions. Include predictive analytics with confidence intervals, automated report narration, and intelligent data storytelling for executive summaries.",
      additionalFeatures: "Comprehensive interactive chart library (bar, line, pie, scatter, heatmaps, treemaps), flexible data export options (CSV, PDF, Excel, JSON), automated scheduled reports with email delivery, granular user permissions and role-based access control, extensive API integrations for data sources, real-time data streaming and live updates, drag-and-drop custom dashboard builder, advanced filtering and drill-down capabilities, mobile-responsive design, dark/light theme switching, collaboration features with comments and sharing, and comprehensive audit logging",
      deploymentPreference: "AWS",
      authenticationMethod: "SAML"
    },
    "Task Management System": {
      projectDescription: "An advanced project management and task tracking platform featuring intelligent kanban boards, comprehensive gantt charts, team collaboration tools, sophisticated time tracking, and AI-powered project insights. The system includes automated task prioritization, resource allocation optimization, productivity analytics with detailed reporting, and enhanced team efficiency tools. Users can manage complex projects, track progress across multiple dimensions, collaborate seamlessly with team members, and leverage AI assistance for project planning and optimization.",
      frontendTechStack: ["React", "Next.js", "TypeScript"],
      backendTechStack: ["NestJS", "PostgreSQL", "Node.js"],
      customFrontendTech: ["DnD Kit", "React Calendar", "Chart.js", "React Hook Form", "React Query"],
      customBackendTech: ["WebSockets", "Bull Queue", "Notification System", "Cron Jobs", "File Storage"],
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      a2aIntegrationDetails: "Intelligent project orchestration: Task Prioritization Agent communicates with Deadline Management Agent for optimal scheduling and resource allocation. Resource Allocation Agent coordinates with Team Capacity Agent for balanced workload distribution. Productivity Analysis Agent works with Performance Tracking Agent for comprehensive team insights. Project Planning Agent integrates with Risk Assessment Agent for proactive project management. Notification Agent coordinates with Communication Agent for timely updates.",
      advancedPromptDetails: "Advanced RAG 2.0 implementation for project templates and best practices retrieval from extensive knowledge base. AI-powered task suggestions and automated task breakdown based on project history and team performance metrics. Intelligent deadline estimation using historical data, team velocity, and complexity analysis. Include predictive project health monitoring, automated resource conflict resolution, and intelligent milestone planning.",
      additionalFeatures: "Interactive kanban boards with custom workflows, comprehensive gantt charts with dependency management, detailed time tracking and reporting, integrated team chat and communication, advanced file sharing and version control, customizable reporting dashboard with analytics, extensive integrations with external tools and services, mobile application with offline capabilities, custom workflow automation, advanced permission management, project templates and cloning, automated backup and recovery, and comprehensive API for third-party integrations",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    },
    "Healthcare Management": {
      projectDescription: "A comprehensive healthcare management system featuring secure patient records management, intelligent appointment scheduling, integrated telemedicine capabilities, and AI-powered diagnostic assistance. The platform is fully HIPAA-compliant with advanced security measures, secure data handling protocols, and integrated medical workflows. Healthcare providers can manage patient information, conduct virtual consultations, track medical history, generate reports, and leverage AI assistance for preliminary diagnostics while maintaining the highest standards of patient privacy and data security.",
      frontendTechStack: ["React", "Next.js", "TypeScript"],
      backendTechStack: ["NestJS", "PostgreSQL", "Node.js"],
      customFrontendTech: ["Video SDK", "Medical Forms", "HIPAA Components", "Medical Charts", "Secure Chat"],
      customBackendTech: ["HIPAA Compliance", "Medical APIs", "Encryption", "Audit Logging", "Secure Storage"],
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "Enterprise MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Secure healthcare orchestration: Appointment Scheduling Agent coordinates with Calendar Management Agent and Patient Notification Agent for seamless scheduling. Diagnostic Assistance Agent communicates with Medical Knowledge Agent for evidence-based recommendations. Patient Record Agent works with Privacy Compliance Agent for secure data handling. Telemedicine Agent integrates with Video Conference Agent for secure virtual consultations. Billing Agent coordinates with Insurance Processing Agent for claims management.",
      advancedPromptDetails: "Advanced RAG 2.0 for comprehensive medical knowledge base and patient history analysis with strict privacy controls. AI-powered symptom analysis and treatment recommendations based on current medical literature and best practices. Intelligent appointment scheduling considering urgency levels, doctor availability, and patient preferences. Include medication interaction checking, automated clinical decision support, and intelligent medical coding assistance.",
      additionalFeatures: "Secure video consultations with recording capabilities, comprehensive patient records management with medical history tracking, intelligent prescription management with drug interaction checking, automated appointment scheduling and reminders, secure messaging between patients and providers, integrated billing and insurance processing, automated medical report generation, laboratory results integration and tracking, medical imaging support and storage, comprehensive audit trails for compliance, mobile application for patients and providers, and integration with external medical systems and databases",
      deploymentPreference: "AWS",
      authenticationMethod: "SAML"
    }
  };

  const handleTemplateSelect = (spec: ProjectSpec) => {
    console.log("QuickFillButton: Applying comprehensive template", spec);
    onQuickFill(spec);
    
    toast({
      title: "Template Applied Successfully",
      description: "All form fields have been populated with the selected template data.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-accent">
          <Zap className="h-4 w-4 mr-2" />
          Quick Fill Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {Object.entries(templates).map(([name, spec]) => (
          <DropdownMenuItem 
            key={name} 
            onClick={() => handleTemplateSelect(spec)}
            className="cursor-pointer hover:bg-accent p-3"
          >
            <div className="space-y-2 w-full">
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-muted-foreground line-clamp-3">
                {spec.projectDescription.substring(0, 150)}...
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {spec.frontendTechStack.slice(0, 3).map(tech => (
                  <span key={tech} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickFillButton;
