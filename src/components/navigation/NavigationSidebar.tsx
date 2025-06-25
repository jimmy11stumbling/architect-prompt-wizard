import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Network, Wrench, Monitor, Workflow, Settings, BookOpen, TestTube, Zap, Home, BarChart3 } from "lucide-react";
const NavigationSidebar: React.FC = () => {
  const location = useLocation();
  const navItems = [{
    path: "/",
    label: "Home",
    icon: Home,
    description: "Project creation and prompt generation"
  }, {
    path: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
    description: "System overview and metrics"
  }, {
    path: "/reasoner",
    label: "DeepSeek Reasoner",
    icon: Brain,
    description: "Advanced reasoning with chain-of-thought",
    badge: "New"
  }, {
    path: "/enhanced",
    label: "Enhanced Features",
    icon: Zap,
    description: "Integrated AI capabilities",
    badge: "Pro"
  }, {
    path: "/rag",
    label: "RAG 2.0 Database",
    icon: Database,
    description: "Knowledge retrieval and search"
  }, {
    path: "/a2a",
    label: "A2A Protocol",
    icon: Network,
    description: "Agent-to-agent communication"
  }, {
    path: "/mcp",
    label: "MCP Hub",
    icon: Wrench,
    description: "Model context protocol tools"
  }, {
    path: "/workflow",
    label: "Workflow Engine",
    icon: Workflow,
    description: "Integrated workflow automation"
  }, {
    path: "/saved-prompts",
    label: "Saved Prompts",
    icon: BookOpen,
    description: "Prompt library and templates"
  }, {
    path: "/testing",
    label: "Testing Suite",
    icon: TestTube,
    description: "Component and system testing"
  }];
  return <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-blue-400/20 flex flex-col h-screen">
      {/* Header with logo */}
      

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-3">
          Core Features
        </div>
        
        {navItems.slice(0, 4).map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return <Link key={item.path} to={item.path}>
              <Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start h-auto p-3 flex flex-col items-start ${isActive ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white" : "hover:bg-blue-500/10 hover:border-blue-400/20 text-slate-300"}`}>
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-300" : "text-slate-400"}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                      {item.badge}
                    </Badge>}
                </div>
                <p className="text-xs text-slate-400 text-left mt-1">
                  {item.description}
                </p>
              </Button>
            </Link>;
      })}

        <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-3 mt-6">
          Integration Systems
        </div>
        
        {navItems.slice(4, 8).map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return <Link key={item.path} to={item.path}>
              <Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start h-auto p-3 flex flex-col items-start ${isActive ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white" : "hover:bg-blue-500/10 hover:border-blue-400/20 text-slate-300"}`}>
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-300" : "text-slate-400"}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                      {item.badge}
                    </Badge>}
                </div>
                <p className="text-xs text-slate-400 text-left mt-1">
                  {item.description}
                </p>
              </Button>
            </Link>;
      })}

        <div className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-3 mt-6">
          Tools & Utilities
        </div>
        
        {navItems.slice(8).map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return <Link key={item.path} to={item.path}>
              <Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start h-auto p-3 flex flex-col items-start ${isActive ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white" : "hover:bg-blue-500/10 hover:border-blue-400/20 text-slate-300"}`}>
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-300" : "text-slate-400"}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                      {item.badge}
                    </Badge>}
                </div>
                <p className="text-xs text-slate-400 text-left mt-1">
                  {item.description}
                </p>
              </Button>
            </Link>;
      })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-400/20">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All Systems Online</span>
          </div>
          <div className="text-blue-300">DeepSeek Reasoner • RAG 2.0 • A2A • MCP</div>
        </div>
      </div>
    </div>;
};
export default NavigationSidebar;