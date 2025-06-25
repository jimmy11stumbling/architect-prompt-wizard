
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap } from "lucide-react";
import { ProjectSpec } from "@/types/ipa-types";

interface QuickFillButtonProps {
  onQuickFill: (spec: ProjectSpec) => void;
}

const QuickFillButton: React.FC<QuickFillButtonProps> = ({ onQuickFill }) => {
  const templates: Record<string, ProjectSpec> = {
    "E-commerce Platform": {
      projectDescription: "A modern e-commerce platform with AI-powered product recommendations, real-time inventory management, and seamless payment processing. Features include user authentication, product catalog, shopping cart, order management, and admin dashboard with analytics.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["Express", "PostgreSQL"],
      customFrontendTech: ["TailwindCSS", "Stripe Components", "React Hook Form"],
      customBackendTech: ["Stripe API", "Redis", "JWT Auth"],
      ragVectorDb: "Chroma",
      customRagVectorDb: "",
      mcpType: "Enhanced MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Implement agent communication for inventory updates between product catalog agent and inventory management agent. Recommendation engine agent communicates with user behavior tracking agent. Order processing agent coordinates with payment processing agent and shipping notification agent.",
      advancedPromptDetails: "Use context-aware prompting for product recommendations based on user browsing history and purchase patterns. Implement RAG for product information retrieval and customer service automation. Include conversation memory for personalized shopping experiences.",
      additionalFeatures: "Payment gateway integration (Stripe/PayPal), email notifications, analytics dashboard, mobile responsiveness, product reviews and ratings, wishlist functionality, inventory alerts, multi-currency support",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    },
    "AI Chat Application": {
      projectDescription: "An intelligent chat application with multi-agent conversation support, document analysis, and real-time collaboration features. Includes AI-powered responses, file sharing, conversation management, and advanced natural language processing capabilities.",
      frontendTechStack: ["React", "Vue"],
      backendTechStack: ["FastAPI", "MongoDB"],
      customFrontendTech: ["Socket.io Client", "React Query", "Framer Motion"],
      customBackendTech: ["Socket.io", "WebRTC", "AI APIs"],
      ragVectorDb: "Pinecone",
      customRagVectorDb: "",
      mcpType: "Enterprise MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Multi-agent conversation handling with conversation moderator agent coordinating with response generation agent. Document processing agent communicates with content analysis agent. Real-time message routing between AI agents for contextual responses and conversation flow management.",
      advancedPromptDetails: "Context-aware conversation management with memory of previous interactions. Document summarization using RAG for uploaded files. Intelligent response generation with personality adaptation and conversation style matching.",
      additionalFeatures: "File upload/sharing, real-time messaging, conversation history, user presence indicators, voice messages, message encryption, group chats, emoji reactions, message threading",
      deploymentPreference: "Vercel",
      authenticationMethod: "OAuth"
    },
    "Data Analytics Dashboard": {
      projectDescription: "A comprehensive data analytics platform with AI-driven insights, real-time visualization, and automated reporting. Features interactive charts, KPI tracking, predictive analytics, and customizable dashboard layouts for business intelligence.",
      frontendTechStack: ["React", "Angular"],
      backendTechStack: ["Django", "PostgreSQL"],
      customFrontendTech: ["D3.js", "Chart.js", "React Grid Layout"],
      customBackendTech: ["Pandas", "NumPy", "Celery"],
      ragVectorDb: "Qdrant",
      customRagVectorDb: "",
      mcpType: "Standard MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Data processing agents coordinate with analytics computation agent for real-time insights. Report generation agent communicates with data visualization agent. Predictive analytics agent works with trend analysis agent for forecasting.",
      advancedPromptDetails: "Intelligent data interpretation with natural language query processing. Automated insights generation using RAG for business knowledge base. Smart anomaly detection and alert generation with contextual explanations.",
      additionalFeatures: "Interactive charts (bar, line, pie, heatmaps), data export (CSV, PDF, Excel), scheduled reports, user permissions and roles, API integrations, real-time data streaming, custom dashboard builder",
      deploymentPreference: "AWS",
      authenticationMethod: "SAML"
    },
    "Task Management System": {
      projectDescription: "Advanced project management platform with kanban boards, gantt charts, team collaboration, time tracking, and AI-powered insights. Includes task automation, resource allocation, and productivity analytics for enhanced team efficiency.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["DnD Kit", "React Calendar", "Chart.js"],
      customBackendTech: ["WebSockets", "Bull Queue", "Notification System"],
      ragVectorDb: "Weaviate",
      customRagVectorDb: "",
      mcpType: "MCP with Tools",
      customMcpType: "",
      a2aIntegrationDetails: "Task prioritization agent communicates with deadline management agent for optimal scheduling. Resource allocation agent coordinates with team capacity agent. Productivity analysis agent works with performance tracking agent for insights.",
      advancedPromptDetails: "RAG for project templates and best practices retrieval. AI-powered task suggestions based on project history. Intelligent deadline estimation using historical data and team performance metrics.",
      additionalFeatures: "Kanban boards, gantt charts, time tracking, team chat, file sharing, reporting dashboard, integrations with external tools, mobile app, offline capability, custom workflows",
      deploymentPreference: "Vercel",
      authenticationMethod: "JWT"
    },
    "Healthcare Management": {
      projectDescription: "Comprehensive healthcare management system with patient records, appointment scheduling, telemedicine capabilities, and AI-powered diagnostic assistance. HIPAA-compliant with secure data handling and integrated medical workflows.",
      frontendTechStack: ["React", "Next.js"],
      backendTechStack: ["NestJS", "PostgreSQL"],
      customFrontendTech: ["Video SDK", "Medical Forms", "HIPAA Components"],
      customBackendTech: ["HIPAA Compliance", "Medical APIs", "Encryption"],
      ragVectorDb: "PGVector",
      customRagVectorDb: "",
      mcpType: "Enterprise MCP",
      customMcpType: "",
      a2aIntegrationDetails: "Appointment scheduling agent coordinates with calendar management agent and notification agent. Diagnostic assistance agent communicates with medical knowledge agent. Patient record agent works with privacy compliance agent for secure data handling.",
      advancedPromptDetails: "RAG for medical knowledge base and patient history analysis. AI-powered symptom analysis and treatment recommendations. Intelligent appointment scheduling based on urgency and doctor availability.",
      additionalFeatures: "Video consultations, patient records management, prescription management, appointment scheduling, secure messaging, billing integration, medical report generation, lab results integration",
      deploymentPreference: "AWS",
      authenticationMethod: "SAML"
    }
  };

  const handleTemplateSelect = (spec: ProjectSpec) => {
    console.log("QuickFillButton: Applying template", spec);
    onQuickFill(spec);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Quick Fill
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {Object.entries(templates).map(([name, spec]) => (
          <DropdownMenuItem key={name} onClick={() => handleTemplateSelect(spec)}>
            <div className="space-y-1">
              <div className="font-medium">{name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {spec.projectDescription.substring(0, 100)}...
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickFillButton;
