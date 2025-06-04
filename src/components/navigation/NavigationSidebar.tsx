
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  LayoutDashboard, 
  Brain, 
  Zap,
  Database, 
  Network, 
  Settings, 
  GitBranch, 
  BookOpen, 
  TestTube 
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "DeepSeek Reasoner", href: "/reasoner", icon: Brain },
  { name: "Enhanced System", href: "/enhanced", icon: Zap },
  { name: "RAG 2.0", href: "/rag", icon: Database },
  { name: "A2A Network", href: "/a2a", icon: Network },
  { name: "MCP Hub", href: "/mcp", icon: Settings },
  { name: "Workflow", href: "/workflow", icon: GitBranch },
  { name: "Saved Prompts", href: "/saved-prompts", icon: BookOpen },
  { name: "Testing", href: "/testing", icon: TestTube },
];

export const NavigationSidebar: React.FC = () => {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-4 border-b">
        <h2 className="text-lg font-semibold text-gradient">IPA System</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium">Enhanced AI System</div>
          <div>RAG 2.0 • A2A • MCP • DeepSeek</div>
        </div>
      </div>
    </div>
  );
};
