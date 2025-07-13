
import React from "react";
import Header from "@/components/Header";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: React.ReactNode;
  onSelectTemplate?: (spec: any) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onSelectTemplate }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationSidebar />
        <div className="flex-1 flex flex-col">
          {onSelectTemplate && <Header onSelectTemplate={onSelectTemplate} />}
          <main className="flex-1 container py-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          <footer className="border-t border-blue-400/20 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="container text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img 
                  src="/lovable-uploads/0b601e77-6a17-4bff-ab47-fcf8bdb6e879.png" 
                  alt="NoCodeLos Logo" 
                  className="h-6 w-6 object-contain"
                />
                <span className="text-sm font-medium text-gradient">NoCodeLos</span>
              </div>
              <p className="text-sm text-slate-400">
                Intelligent Prompt Architect - Powered by DeepSeek models with advanced RAG 2.0 and MCP integration
              </p>
            </div>
          </footer>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default MainLayout;
