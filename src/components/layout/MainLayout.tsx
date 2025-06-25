
import React from "react";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: React.ReactNode;
  onSelectTemplate: (spec: any) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onSelectTemplate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSelectTemplate={onSelectTemplate} />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          Intelligent Prompt Architect (IPA) - Powered by DeepSeek models with advanced RAG 2.0 and MCP integration
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default MainLayout;
