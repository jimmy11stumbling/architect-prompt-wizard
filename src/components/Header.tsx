
import React from "react";
import { Cpu, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateDialog } from "@/components/templates";
import { ProjectSpec } from "@/types/ipa-types";

interface HeaderProps {
  onSelectTemplate?: (spec: ProjectSpec) => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectTemplate }) => {
  return (
    <header className="border-b border-ipa-border py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-blue-purple p-2 rounded-lg">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center">
              Intelligent Prompt Architect
              <span className="ml-2 text-xs bg-ipa-primary/20 text-ipa-primary px-2 py-0.5 rounded-full">
                BETA
              </span>
            </h1>
            <p className="text-xs text-ipa-muted">Powered by DeepSeek</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TemplateDialog onSelectTemplate={onSelectTemplate || (() => {})}>
            <Button variant="outline" size="sm" className="gap-1">
              <Zap className="h-4 w-4" /> Quick Templates
            </Button>
          </TemplateDialog>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
