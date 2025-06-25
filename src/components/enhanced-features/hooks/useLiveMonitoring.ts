
import { useState, useEffect } from "react";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";
import { AgentName } from "@/types/ipa-types";

export const useLiveMonitoring = () => {
  const [isLive, setIsLive] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const agents: AgentName[] = [
    "RequirementDecompositionAgent",
    "RAGContextIntegrationAgent",
    "A2AProtocolExpertAgent",
    "TechStackImplementationAgent_Frontend",
    "TechStackImplementationAgent_Backend",
    "CursorOptimizationAgent",
    "QualityAssuranceAgent"
  ];

  const systemServices = [
    { name: "RAG 2.0", icon: "Database", status: "active", color: "text-green-500" },
    { name: "A2A Protocol", icon: "Network", status: "active", color: "text-blue-500" },
    { name: "MCP Hub", icon: "Settings", status: "active", color: "text-purple-500" },
    { name: "DeepSeek Reasoner", icon: "Brain", status: "active", color: "text-orange-500" }
  ];

  const fetchLiveData = () => {
    const allResponses = realTimeResponseService.getResponses();
    setResponses(allResponses.slice(-50).reverse());
  };

  const clearLogs = () => {
    realTimeResponseService.clearResponses();
    setResponses([]);
  };

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  useEffect(() => {
    if (isLive) {
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 500);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Real-time console logging for validation
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (responses.length > 0) {
        const latestResponse = responses[0];
        console.log(`🔍 LIVE VALIDATION: [${latestResponse.source}] ${latestResponse.status.toUpperCase()} - ${latestResponse.message}`);
        
        if (latestResponse.data) {
          console.log(`📊 VALIDATION DATA:`, latestResponse.data);
        }
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, [responses]);

  return {
    isLive,
    selectedAgent,
    setSelectedAgent,
    responses,
    agents,
    systemServices,
    toggleLive,
    clearLogs
  };
};
