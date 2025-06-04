
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RAGPage from "./pages/RAGPage";
import A2APage from "./pages/A2APage";
import MCPPage from "./pages/MCPPage";
import ReasonerPage from "./pages/ReasonerPage";
import WorkflowPage from "./pages/WorkflowPage";
import TestingPage from "./pages/TestingPage";
import SavedPromptsPage from "./pages/SavedPromptsPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// Optimized QueryClient configuration for high concurrency
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Router>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <NavigationSidebar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/rag" element={<RAGPage />} />
                    <Route path="/a2a" element={<A2APage />} />
                    <Route path="/mcp" element={<MCPPage />} />
                    <Route path="/reasoner" element={<ReasonerPage />} />
                    <Route path="/workflow" element={<WorkflowPage />} />
                    <Route path="/testing" element={<TestingPage />} />
                    <Route path="/saved" element={<SavedPromptsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
