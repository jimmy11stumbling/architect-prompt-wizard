import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import ReasonerPage from "./pages/ReasonerPage";
import RAGPage from "./pages/RAGPage";
import MCPPage from "./pages/MCPPage";
import MCPHubPage from "./pages/MCPHubPage";
import A2APage from "./pages/A2APage";
import SavedPromptsPage from "./pages/SavedPromptsPage";
import TestingPage from "./pages/TestingPage";
import WorkflowPage from "./pages/WorkflowPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import SettingsPage from "./pages/SettingsPage";
import AdvancedSettingsPage from "./pages/AdvancedSettingsPage";
import EnhancedPage from "./pages/EnhancedPage";
import NotFound from "./pages/NotFound";
import WorkflowNotifications from "./components/workflow/WorkflowNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/index" element={<Index />} />
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reasoner" element={<ReasonerPage />} />
                  <Route path="/rag" element={<RAGPage />} />
                  <Route path="/mcp" element={<MCPPage />} />
                  <Route path="/mcp-hub" element={<MCPHubPage />} />
                  <Route path="/a2a" element={<A2APage />} />
                  <Route path="/saved-prompts" element={<SavedPromptsPage />} />
                  <Route path="/testing" element={<TestingPage />} />
                  <Route path="/workflow" element={<WorkflowPage />} />
                  <Route path="/analytics" element={<AnalyticsDashboardPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/advanced-settings" element={<AdvancedSettingsPage />} />
                  <Route path="/enhanced" element={<EnhancedPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <WorkflowNotifications />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;