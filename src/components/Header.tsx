
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
    <header className="border-b border-ipa-border py-4 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="/lovable-uploads/0b601e77-6a17-4bff-ab47-fcf8bdb6e879.png" 
              alt="NoCodeLos Logo" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center text-gradient">
              NoCodeLos IPA
              <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30">
                BETA
              </span>
            </h1>
            <p className="text-xs text-blue-300">Intelligent Prompt Architect</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TemplateDialog onSelectTemplate={onSelectTemplate || (() => {})}>
            <Button variant="outline" size="sm" className="gap-1 border-blue-400/30 hover:bg-blue-500/10">
              <Zap className="h-4 w-4 text-orange-400" /> Quick Templates
            </Button>
          </TemplateDialog>
          <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
            <Settings className="h-5 w-5 text-purple-300" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
