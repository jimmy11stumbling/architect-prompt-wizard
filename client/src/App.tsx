
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ReasonerPage from "./pages/ReasonerPage";
import EnhancedPage from "./pages/EnhancedPage";
import RAGPage from "./pages/RAGPage";
import A2APage from "./pages/A2APage";
import MCPPage from "./pages/MCPPage";
import MCPHubPage from "./pages/MCPHubPage";
import WorkflowPage from "./pages/WorkflowPage";
import SavedPromptsPage from "./pages/SavedPromptsPage";
import TestingPage from "./pages/TestingPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reasoner" element={<ReasonerPage />} />
              <Route path="/enhanced" element={<EnhancedPage />} />
              <Route path="/rag" element={<RAGPage />} />
              <Route path="/a2a" element={<A2APage />} />
              <Route path="/mcp" element={<MCPPage />} />
              <Route path="/mcp-hub" element={<MCPHubPage />} />
              <Route path="/workflow" element={<WorkflowPage />} />
              <Route path="/saved-prompts" element={<SavedPromptsPage />} />
              <Route path="/testing" element={<TestingPage />} />
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
