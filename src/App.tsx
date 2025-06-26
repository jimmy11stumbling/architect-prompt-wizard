
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthWrapper from "@/components/auth/AuthWrapper";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SavedPromptsPage from "./pages/SavedPromptsPage";
import TestingPage from "./pages/TestingPage";
import EnhancedPage from "./pages/EnhancedPage";
import RAGPage from "./pages/RAGPage";
import MCPPage from "./pages/MCPPage";
import A2APage from "./pages/A2APage";
import ReasonerPage from "./pages/ReasonerPage";
import WorkflowPage from "./pages/WorkflowPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import AdvancedSettingsPage from "./pages/AdvancedSettingsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/saved-prompts" element={<SavedPromptsPage />} />
            <Route path="/testing" element={<TestingPage />} />
            <Route path="/enhanced" element={<EnhancedPage />} />
            <Route path="/rag" element={<RAGPage />} />
            <Route path="/mcp" element={<MCPPage />} />
            <Route path="/a2a" element={<A2APage />} />
            <Route path="/reasoner" element={<ReasonerPage />} />
            <Route path="/workflow" element={<WorkflowPage />} />
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/settings" element={<AdvancedSettingsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
