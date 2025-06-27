
import { DeepSeekCompletionRequest, DeepSeekCompletionResponse, AgentName } from "@/types/ipa-types";
import { toast } from "@/hooks/use-toast";

export class DeepSeekClient {
  private static readonly API_URL = "https://api.deepseek.com/v1/chat/completions";
  
  static async makeApiCall(request: DeepSeekCompletionRequest): Promise<DeepSeekCompletionResponse> {
    const apiKey = localStorage.getItem("deepseek_api_key");
    
    if (!apiKey) {
      throw new Error("NO_API_KEY");
    }

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Real-time streaming chat response with DeepSeek
   */
  static async streamChatResponse(
    request: DeepSeekCompletionRequest,
    onToken: (token: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const apiKey = localStorage.getItem("deepseek_api_key");
    
    if (!apiKey) {
      throw new Error("NO_API_KEY");
    }

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          ...request,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith("data:")) {
            const jsonStr = part.slice(5).trim();
            if (jsonStr === "[DONE]") {
              onComplete?.();
              return;
            }
            
            try {
              const parsed = JSON.parse(jsonStr);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                onToken(token);
              }
            } catch (e) {
              console.warn("JSON parse error in stream:", e);
            }
          }
        }
        
        buffer = parts[parts.length - 1];
      }
      
      onComplete?.();
    } catch (error) {
      console.error("Streaming error:", error);
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Batch process multiple agents with streaming support
   */
  static async streamAgentResponses(
    agents: { name: AgentName; request: DeepSeekCompletionRequest }[],
    onAgentStart: (agentName: AgentName) => void,
    onAgentToken: (agentName: AgentName, token: string) => void,
    onAgentComplete: (agentName: AgentName, fullResponse: string) => void,
    onAllComplete: () => void
  ): Promise<void> {
    let completedCount = 0;
    const responses: Record<AgentName, string> = {} as Record<AgentName, string>;

    for (const { name, request } of agents) {
      responses[name] = "";
      onAgentStart(name);

      try {
        await this.streamChatResponse(
          request,
          (token) => {
            responses[name] += token;
            onAgentToken(name, token);
          },
          () => {
            onAgentComplete(name, responses[name]);
            completedCount++;
            if (completedCount === agents.length) {
              onAllComplete();
            }
          },
          (error) => {
            console.error(`Error for agent ${name}:`, error);
            completedCount++;
            if (completedCount === agents.length) {
              onAllComplete();
            }
          }
        );
      } catch (error) {
        console.error(`Failed to start stream for agent ${name}:`, error);
        completedCount++;
        if (completedCount === agents.length) {
          onAllComplete();
        }
      }
    }
  }

  static handleApiError(error: any, agent: AgentName): void {
    console.error(`DeepSeek API error for ${agent}:`, error);
    
    if (error.message === "NO_API_KEY") {
      toast({
        title: "API Key Required",
        description: "Please configure your DeepSeek API key to use real API responses",
        variant: "destructive"
      });
    } else {
      toast({
        title: "API Error",
        description: `Failed to get response from DeepSeek for ${agent}`,
        variant: "destructive"
      });
    }
  }
}
