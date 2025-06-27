
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
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
      <Router>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <NavigationSidebar />
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/" component={Index} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/reasoner" component={ReasonerPage} />
                <Route path="/enhanced" component={EnhancedPage} />
                <Route path="/rag" component={RAGPage} />
                <Route path="/a2a" component={A2APage} />
                <Route path="/mcp" component={MCPPage} />
                <Route path="/workflow" component={WorkflowPage} />
                <Route path="/saved-prompts" component={SavedPromptsPage} />
                <Route path="/testing" component={TestingPage} />
                <Route path="/settings" component={AdvancedSettingsPage} />
                <Route path="/analytics" component={AnalyticsDashboardPage} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
        <Sonner />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
