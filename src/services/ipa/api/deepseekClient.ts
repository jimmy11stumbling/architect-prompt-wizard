
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
