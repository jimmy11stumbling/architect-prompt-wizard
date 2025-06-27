
import { AgentName, ProjectSpec, DeepSeekCompletionResponse } from "@/types/ipa-types";

export class ResponseSimulator {
  static async simulateResponse(agent: AgentName, spec: ProjectSpec): Promise<DeepSeekCompletionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const simulatedResponses: Record<AgentName, string> = {
      "reasoning-assistant": `As the Reasoning Assistant, I recommend implementing a multi-step reasoning pipeline for ${spec.projectDescription}. Key considerations include logical flow validation, error handling, and decision tree optimization.`,
      
      "context-analyzer": `Context Analysis for ${spec.projectDescription}: The project requires careful integration of ${spec.frontendTechStack.join(", ")} with ${spec.backendTechStack.join(", ")}. Critical context elements include user workflows, data patterns, and system interactions.`,
      
      "documentation-expert": `Documentation Strategy: Comprehensive technical documentation should include API specifications, component libraries, deployment guides, and user manuals. Focus on maintainable, version-controlled documentation.`,
      
      "workflow-coordinator": `Workflow Design: Implement orchestrated workflows with proper error handling, rollback mechanisms, and monitoring. Consider async processing for heavy operations.`,
      
      "reasoning-coordinator": `Reasoning Coordination: Establish clear decision points, validation checkpoints, and logical flow controls throughout the system architecture.`,
      
      "RequirementDecompositionAgent": `Requirement Breakdown: Core components include user authentication, data management, API integration, and UI/UX implementation. Each should be independently testable and deployable.`,
      
      "RAGContextIntegrationAgent": `RAG 2.0 Implementation: Use ${spec.ragVectorDb} for vector storage with hybrid search capabilities. Implement semantic chunking, reranking, and context compression for optimal retrieval.`,
      
      "A2AProtocolExpertAgent": `A2A Protocol Design: Implement agent discovery, message routing, and coordination protocols. Use standardized communication patterns for reliable multi-agent interaction.`,
      
      "TechStackImplementationAgent_Frontend": `Frontend Architecture: Build with ${spec.frontendTechStack.join(", ")} using component-based architecture, state management, and responsive design principles.`,
      
      "TechStackImplementationAgent_Backend": `Backend Architecture: Implement ${spec.backendTechStack.join(", ")} with microservices architecture, API gateways, and proper data persistence strategies.`,
      
      "CursorOptimizationAgent": `Cursor IDE Optimization: Configure intelligent code completion, custom rules, and workflow automation. Implement project-specific templates and shortcuts.`,
      
      "QualityAssuranceAgent": `Quality Assurance: Implement comprehensive testing strategy including unit tests, integration tests, and end-to-end testing. Use automated CI/CD pipelines and code quality metrics.`
    };

    const content = simulatedResponses[agent] || `Simulated response for ${agent} regarding ${spec.projectDescription}`;

    return {
      id: `sim-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "deepseek-chat",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: content
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300
      }
    };
  }
}
