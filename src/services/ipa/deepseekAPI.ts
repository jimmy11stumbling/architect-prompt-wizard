
import { ProjectSpec, AgentName, DeepSeekCompletionRequest, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt, createUserMessageFromSpec } from "./agentPrompts";
import { DeepSeekClient } from "./api/deepseekClient";
import { ResponseSimulator } from "./api/responseSimulator";
import { ConversationBuilder } from "./conversation/conversationBuilder";

/**
 * Helper function to invoke DeepSeek API for a specific agent
 */
export const invokeDeepSeekAgent = async (agent: AgentName, spec: ProjectSpec, messageHistory: DeepSeekMessage[] = []): Promise<{content: string}> => {
  if (!spec) {
    throw new Error("Project specification is required");
  }
  
  // Get system prompt and user message for this agent
  const systemPrompt = getAgentSystemPrompt(agent, spec);
  const userMessage = createUserMessageFromSpec(agent, spec);
  
  // Create the messages array for DeepSeek Chat
  const messages: DeepSeekMessage[] = messageHistory.length > 0 ? 
    [...messageHistory] : [];
  
  // Always add the current agent's system prompt and user message
  messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });
  
  const requestBody: DeepSeekCompletionRequest = {
    model: "deepseek-chat",
    messages: messages,
    max_tokens: 4096
  };
  
  try {
    console.log(`Making API call to DeepSeek for agent ${agent} with ${messages.length} messages in history`);
    
    let data;
    
    try {
      data = await DeepSeekClient.makeApiCall(requestBody);
    } catch (error) {
      if (error instanceof Error && error.message === "NO_API_KEY") {
        data = await ResponseSimulator.simulateResponse(agent, spec);
      } else {
        throw error;
      }
    }
    
    const completionMessage = data.choices[0].message;
    
    console.log(`Received response for agent ${agent}`, {
      contentLength: completionMessage.content.length,
    });
    
    return {
      content: completionMessage.content,
    };
  } catch (error) {
    DeepSeekClient.handleApiError(error, agent);
    throw error;
  }
};

/**
 * Helper function to build a conversation history with multiple agents
 * This implements the multi-round conversation approach
 */
export const buildConversationHistory = ConversationBuilder.buildConversationHistory;
