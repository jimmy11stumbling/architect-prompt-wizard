
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { SidebarProvider } from "@/components/ui/sidebar";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";
import ErrorBoundary from "@/components/ui/error-boundary";
import { AuthProvider } from "@/components/auth/AuthWrapper";
import { initializeDefaultUser } from "@/utils/auth";

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

// Initialize default user session
initializeDefaultUser();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <NavigationSidebar />
                <main className="flex-1 overflow-auto">
                  <Switch>
                    <Route path="/"><Index /></Route>
                    <Route path="/dashboard"><Dashboard /></Route>
                    <Route path="/reasoner"><ReasonerPage /></Route>
                    <Route path="/enhanced"><EnhancedPage /></Route>
                    <Route path="/rag"><RAGPage /></Route>
                    <Route path="/a2a"><A2APage /></Route>
                    <Route path="/mcp"><MCPPage /></Route>
                    <Route path="/workflow"><WorkflowPage /></Route>
                    <Route path="/saved-prompts"><SavedPromptsPage /></Route>
                    <Route path="/testing"><TestingPage /></Route>
                    <Route path="/settings"><AdvancedSettingsPage /></Route>
                    <Route path="/analytics"><AnalyticsDashboardPage /></Route>
                    <Route><NotFound /></Route>
                  </Switch>
                </main>
              </div>
            </SidebarProvider>
            <Toaster />
            <Sonner />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
