
import { useState, useEffect } from "react";
import { WorkflowExecution, AgentNode } from "../types";

export const useWorkflowExecution = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowExecution | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);

  useEffect(() => {
    // Initialize with mock data
    const mockWorkflow: WorkflowExecution = {
      id: "wf_001",
      name: "Cursor AI Prompt Generation",
      status: "running",
      startTime: Date.now() - 45000,
      currentStep: 3,
      totalSteps: 8,
      agents: [
        {
          id: "agent_coordinator",
          name: "Workflow Coordinator",
          type: "coordinator",
          status: "completed",
          progress: 100,
          dependencies: [],
          outputs: ["agent_reasoning", "agent_rag"],
          performance: { avgProcessingTime: 1.2, successRate: 0.98, totalTasks: 156 },
          lastUpdate: Date.now() - 30000
        },
        {
          id: "agent_reasoning",
          name: "DeepSeek Reasoner",
          type: "reasoning",
          status: "processing",
          progress: 65,
          dependencies: ["agent_coordinator"],
          outputs: ["agent_mcp"],
          performance: { avgProcessingTime: 3.4, successRate: 0.94, totalTasks: 89 },
          currentTask: "Analyzing project requirements and generating technical specifications",
          lastUpdate: Date.now() - 1000
        },
        {
          id: "agent_rag",
          name: "RAG Knowledge Retriever",
          type: "rag",
          status: "processing",
          progress: 80,
          dependencies: ["agent_coordinator"],
          outputs: ["agent_mcp"],
          performance: { avgProcessingTime: 2.1, successRate: 0.96, totalTasks: 203 },
          currentTask: "Retrieving relevant documentation and best practices",
          lastUpdate: Date.now() - 500
        },
        {
          id: "agent_mcp",
          name: "MCP Tool Executor",
          type: "mcp",
          status: "waiting",
          progress: 0,
          dependencies: ["agent_reasoning", "agent_rag"],
          outputs: ["agent_a2a"],
          performance: { avgProcessingTime: 1.8, successRate: 0.92, totalTasks: 127 },
          lastUpdate: Date.now() - 15000
        },
        {
          id: "agent_a2a",
          name: "A2A Coordinator",
          type: "a2a",
          status: "idle",
          progress: 0,
          dependencies: ["agent_mcp"],
          outputs: [],
          performance: { avgProcessingTime: 2.5, successRate: 0.95, totalTasks: 78 },
          lastUpdate: Date.now() - 20000
        }
      ]
    };

    setActiveWorkflow(mockWorkflow);
    setWorkflows([mockWorkflow]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveWorkflow(prev => {
        if (!prev) return prev;
        
        const updatedAgents = prev.agents.map(agent => {
          if (agent.status === "processing") {
            const newProgress = Math.min(agent.progress + Math.random() * 5, 100);
            const newStatus: AgentNode['status'] = newProgress >= 100 ? "completed" : "processing";
            return {
              ...agent,
              progress: newProgress,
              status: newStatus,
              lastUpdate: Date.now()
            };
          }
          return agent;
        });

        return { ...prev, agents: updatedAgents };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    activeWorkflow,
    workflows,
    setActiveWorkflow,
    setWorkflows
  };
};
