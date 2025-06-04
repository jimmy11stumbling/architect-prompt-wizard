
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Network, 
  Settings, 
  Brain,
  Workflow,
  TestTube,
  Archive
} from "lucide-react";

const navigationItems = [
  {
    title: "Prompt Generator",
    url: "/",
    icon: FileText,
    description: "Create AI prompts"
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "System overview"
  },
  {
    title: "RAG Query",
    url: "/rag",
    icon: Database,
    description: "Knowledge retrieval"
  },
  {
    title: "A2A Network",
    url: "/a2a",
    icon: Network,
    description: "Agent communication"
  },
  {
    title: "MCP Hub",
    url: "/mcp",
    icon: Settings,
    description: "Protocol management"
  },
  {
    title: "DeepSeek Reasoner",
    url: "/reasoner",
    icon: Brain,
    description: "AI reasoning"
  },
  {
    title: "Integrated Workflow",
    url: "/workflow",
    icon: Workflow,
    description: "End-to-end processing"
  },
  {
    title: "Testing Suite",
    url: "/testing",
    icon: TestTube,
    description: "Component testing"
  },
  {
    title: "Saved Prompts",
    url: "/saved",
    icon: Archive,
    description: "Prompt library"
  }
];

const NavigationSidebar: React.FC = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default NavigationSidebar;
