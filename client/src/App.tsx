
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ReasonerPage from "./pages/ReasonerPage";
import EnhancedPage from "./pages/EnhancedPage";
import RAGPage from "./pages/RAGPage";
import A2APage from "./pages/A2APage";
import MCPPage from "./pages/MCPPage";
import WorkflowPage from "./pages/WorkflowPage";
import SavedPromptsPage from "./pages/SavedPromptsPage";
import TestingPage from "./pages/TestingPage";
import AdvancedSettingsPage from "./pages/AdvancedSettingsPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                <Route path="/settings" element={<AdvancedSettingsPage />} />
                <Route path="/analytics" element={<AnalyticsDashboardPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
