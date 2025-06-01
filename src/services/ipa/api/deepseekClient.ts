
import { DeepSeekCompletionRequest, DeepSeekCompletionResponse } from "@/types/ipa-types";
import { toast } from "@/hooks/use-toast";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export class DeepSeekClient {
  static async makeApiCall(requestBody: DeepSeekCompletionRequest): Promise<DeepSeekCompletionResponse> {
    const apiKey = localStorage.getItem("deepseek_api_key");
    
    if (!apiKey || apiKey === "") {
      throw new Error("NO_API_KEY");
    }

    console.log("Using saved API key for DeepSeek API call");
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }
    
    return await response.json();
  }

  static handleApiError(error: unknown, agent: string): void {
    console.error("Error calling DeepSeek API:", error);
    toast({
      title: "API Error",
      description: `Failed to connect to DeepSeek API: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
  }
}
