import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, Search, Brain, Zap } from "lucide-react";
import { AgentStatus, ProjectSpec } from "@/types/ipa-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AgentContent from "../agent-workflow/AgentContent";
import { ragService } from "@/services/rag/ragService";
import { useToast } from "@/hooks/use-toast";

interface RAGIntegratedAgentWorkflowProps {
  agents: AgentStatus[];
  isGenerating: boolean;
  projectSpec?: ProjectSpec;
  onAgentUpdate?: (agentName: string, ragContext: any) => void;
}

interface RAGContext {
  relevantDocuments: any[];
  platformContext: any;
  technicalContext: any;
  bestPractices: any[];
  searchStats: any;
}

const RAGIntegratedAgentWorkflow: React.FC<RAGIntegratedAgentWorkflowProps> = ({ 
  agents, 
  isGenerating, 
  projectSpec,
  onAgentUpdate 
}) => {
  const [openAgents, setOpenAgents] = useState<Record<string, boolean>>({});
  const [ragContexts, setRagContexts] = useState<Record<string, RAGContext>>({});
  const [ragStats, setRagStats] = useState<any>(null);
  const [isEnhancingAgents, setIsEnhancingAgents] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRAGStats();
    if (projectSpec && agents.length > 0) {
      enhanceAgentsWithRAG();
    }
  }, [projectSpec, agents]);

  const loadRAGStats = async () => {
    try {
      const stats = await ragService.getRAGStats();
      setRagStats(stats);
    } catch (error) {
      console.error('Failed to load RAG stats:', error);
    }
  };

  const enhanceAgentsWithRAG = async () => {
    if (!projectSpec || isEnhancingAgents) return;
    
    setIsEnhancingAgents(true);
    try {
      // Generate comprehensive search queries for each agent
      const agentQueries = {
        'reasoning-assistant': `${projectSpec.projectDescription} architecture patterns best practices`,
        'context-analyzer': `${projectSpec.targetPlatform} platform features limitations requirements`,
        'technology-specialist': `${projectSpec.frontendTechStack?.join(' ')} ${projectSpec.backendTechStack?.join(' ')} implementation`,
        'architecture-designer': `system architecture design patterns microservices ${projectSpec.targetPlatform}`,
        'feature-planner': `feature planning roadmap ${projectSpec.additionalFeatures} user stories`,
        'integration-specialist': `API integration ${projectSpec.ragVectorDb} ${projectSpec.mcpType} protocols`,
        'security-advisor': `${projectSpec.authenticationMethod} security best practices vulnerabilities`,
        'performance-optimizer': `performance optimization caching database scaling ${projectSpec.targetPlatform}`,
        'testing-strategist': `testing strategy unit tests integration tests ${projectSpec.frontendTechStack?.join(' ')}`,
        'deployment-specialist': `${projectSpec.deploymentPreference} deployment CI/CD automation`,
        'documentation-expert': `documentation standards API docs ${projectSpec.targetPlatform} guides`,
        'final-synthesizer': `project synthesis integration deployment ready ${projectSpec.targetPlatform}`
      };

      // Enhance each agent with relevant RAG context
      const newContexts: Record<string, RAGContext> = {};
      
      for (const agent of agents) {
        if (agentQueries[agent.name as keyof typeof agentQueries]) {
          try {
            const searchQuery = agentQueries[agent.name as keyof typeof agentQueries];
            const searchResults = await ragService.searchRAG2(searchQuery, {
              limit: 5,
              semanticWeight: 0.7,
              keywordWeight: 0.3,
              enableReranking: true,
              categories: ['all']
            });

            // Get platform-specific context
            const platformResults = await ragService.searchRAG2(`${projectSpec.targetPlatform} specific features capabilities`, {
              limit: 3,
              semanticWeight: 0.8,
              categories: ['platform']
            });

            newContexts[agent.name] = {
              relevantDocuments: searchResults.results || [],
              platformContext: platformResults.results || [],
              technicalContext: {
                frontend: projectSpec.frontendTechStack,
                backend: projectSpec.backendTechStack,
                rag: projectSpec.ragVectorDb,
                mcp: projectSpec.mcpType,
                auth: projectSpec.authenticationMethod
              },
              bestPractices: searchResults.results?.filter(r => r.content.includes('best practice')) || [],
              searchStats: searchResults.searchStats
            };

            // Notify parent component of agent enhancement
            if (onAgentUpdate) {
              onAgentUpdate(agent.name, newContexts[agent.name]);
            }
          } catch (error) {
            console.error(`Failed to enhance agent ${agent.name}:`, error);
          }
        }
      }

      setRagContexts(newContexts);
      
      toast({
        title: "Agents Enhanced",
        description: `All ${agents.length} agents now have access to comprehensive RAG database context`
      });
    } catch (error) {
      console.error('Failed to enhance agents with RAG:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance agents with RAG context",
        variant: "destructive"
      });
    } finally {
      setIsEnhancingAgents(false);
    }
  };

  const toggleAgent = (agent: string) => {
    setOpenAgents(prev => ({
      ...prev,
      [agent]: !prev[agent]
    }));
  };

  const getAgentEnhancementStatus = (agentName: string) => {
    const context = ragContexts[agentName];
    if (!context) return { status: 'pending', documents: 0 };
    
    const totalDocs = context.relevantDocuments.length + context.platformContext.length;
    return {
      status: totalDocs > 0 ? 'enhanced' : 'basic',
      documents: totalDocs,
      bestPractices: context.bestPractices.length
    };
  };

  return (
    <div className="space-y-4">
      {/* RAG Integration Status */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="flex flex-col space-y-1.5 p-6 pb-3 bg-[#182134]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">RAG 2.0 Master Blueprint Integration</CardTitle>
            </div>
            {ragStats && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {ragStats.documentsIndexed} docs indexed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 bg-[#182134]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span>Hybrid Search Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>Platform Context Enhanced</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>Real-time Agent Enrichment</span>
            </div>
          </div>
          
          {isEnhancingAgents && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Enhancing agents with RAG context...</span>
                <span>Processing {agents.length} agents</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={enhanceAgentsWithRAG}
              disabled={isEnhancingAgents || !projectSpec}
            >
              {isEnhancingAgents ? "Enhancing..." : "Refresh RAG Context"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadRAGStats}
            >
              Update Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Agent Workflow */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>RAG-Enhanced DeepSeek Synthesis Swarm</span>
            {isGenerating && (
              <span className="text-sm text-ipa-primary animate-pulse">
                (Processing with RAG Context...)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {agents.map((agent, index) => {
              const key = `${agent.name}-${index}`;
              const enhancementStatus = getAgentEnhancementStatus(agent.name);
              
              return (
                <React.Fragment key={key}>
                  <motion.div
                    className={`relative flex flex-col p-3 rounded-md border ${
                      agent.status === "processing"
                        ? "bg-ipa-primary/10 border-ipa-primary/20"
                        : agent.status === "completed"
                        ? "bg-ipa-success/10 border-ipa-success/20"
                        : agent.status === "failed" || agent.status === "error"
                        ? "bg-ipa-error/10 border-ipa-error/20"
                        : "bg-muted/30 border-muted"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* RAG Enhancement Badge */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {enhancementStatus.status === 'enhanced' && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-green-100 text-green-800"
                        >
                          <Database className="h-3 w-3 mr-1" />
                          {enhancementStatus.documents} docs
                        </Badge>
                      )}
                      {enhancementStatus.bestPractices > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {enhancementStatus.bestPractices} best practices
                        </Badge>
                      )}
                    </div>

                    <AgentContent 
                      agent={{
                        ...agent,
                        ragContext: ragContexts[agent.name]
                      }} 
                      isOpen={!!openAgents[agent.name]} 
                      onToggle={() => toggleAgent(agent.name)} 
                    />
                    
                    {/* RAG Context Preview */}
                    {ragContexts[agent.name] && openAgents[agent.name] && (
                      <div className="mt-3 p-3 bg-muted/50 rounded border">
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          RAG Context Summary
                        </h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>
                            <strong>Relevant Documents:</strong> {ragContexts[agent.name].relevantDocuments.length}
                          </div>
                          <div>
                            <strong>Platform Context:</strong> {ragContexts[agent.name].platformContext.length} specific items
                          </div>
                          <div>
                            <strong>Best Practices:</strong> {ragContexts[agent.name].bestPractices.length} recommendations
                          </div>
                          {ragContexts[agent.name].searchStats && (
                            <div>
                              <strong>Search Quality:</strong> 
                              {ragContexts[agent.name].searchStats.semanticResults} semantic + 
                              {ragContexts[agent.name].searchStats.keywordResults} keyword matches
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                  
                  {index < agents.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <span>Context flows to next agent</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RAGIntegratedAgentWorkflow;