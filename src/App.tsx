
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { NavigationSidebar } from "@/components/navigation/NavigationSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { systemIntegrationService } from "@/services/integration/systemIntegrationService";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import ReasonerPage from "@/pages/ReasonerPage";
import EnhancedPage from "@/pages/EnhancedPage";
import RAGPage from "@/pages/RAGPage";
import A2APage from "@/pages/A2APage";
import MCPPage from "@/pages/MCPPage";
import WorkflowPage from "@/pages/WorkflowPage";
import SavedPromptsPage from "@/pages/SavedPromptsPage";
import TestingPage from "@/pages/TestingPage";
import NotFound from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize the system when the app starts
    const initializeSystem = async () => {
      try {
        await systemIntegrationService.initialize({
          projectDescription: "IPA System with RAG, A2A, and MCP integration",
          frontendTechStack: ["React"],
          backendTechStack: ["Express"],
          customFrontendTech: [],
          customBackendTech: [],
          a2aIntegrationDetails: "Full A2A protocol integration",
          additionalFeatures: "Enhanced AI system with DeepSeek Reasoner",
          ragVectorDb: "Chroma",
          customRagVectorDb: "",
          mcpType: "Extended MCP",
          customMcpType: "",
          advancedPromptDetails: "Advanced prompting with chain-of-thought"
        });
      } catch (error) {
        console.error("Failed to initialize system:", error);
      }
    };

    initializeSystem();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <ErrorBoundary>
            <div className="flex h-screen bg-background">
              <NavigationSidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reasoner" element={<ReasonerPage />} />
                  <Route path="/enhanced" element={<EnhancedPage />} />
                  <Route path="/rag" element={<RAGPage />} />
                  <Route path="/a2a" element={<A2APage />} />
                  <Route path="/mcp" element={<MCPPage />} />
                  <Route path="/workflow" element={<WorkflowPage />} />
                  <Route path="/saved-prompts" element={<SavedPromptsPage />} />
                  <Route path="/testing" element={<TestingPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
