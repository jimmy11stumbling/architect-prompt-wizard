
import { ProjectSpec, AgentName, DeepSeekCompletionRequest, DeepSeekCompletionResponse, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt, createUserMessageFromSpec } from "./agentPrompts";

// In a real app, this would be stored securely in environment variables
const DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"; // Replace with your actual API key
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Helper function to invoke DeepSeek API for a specific agent
 */
export const invokeDeepSeekAgent = async (agent: AgentName, spec: ProjectSpec): Promise<{content: string, reasoningContent: string}> => {
  const systemPrompt = getAgentSystemPrompt(agent, spec);
  const userMessage = createUserMessageFromSpec(agent, spec);
  
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];
  
  const requestBody: DeepSeekCompletionRequest = {
    model: "deepseek-reasoner",
    messages: messages,
    max_tokens: 4096
  };
  
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }
    
    const data: DeepSeekCompletionResponse = await response.json();
    const completionMessage = data.choices[0].message;
    
    return {
      content: completionMessage.content,
      reasoningContent: completionMessage.reasoning_content
    };
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
};
