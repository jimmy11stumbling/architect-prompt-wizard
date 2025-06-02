
import { DeepSeekCompletionRequest, DeepSeekCompletionResponse } from "@/types/ipa-types";
import { toast } from "@/hooks/use-toast";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export class DeepSeekClient {
  static async makeApiCall(requestBody: DeepSeekCompletionRequest): Promise<DeepSeekCompletionResponse> {
    const apiKey = localStorage.getItem("deepseek_api_key");
    
    if (!apiKey || apiKey === "") {
      throw new Error("NO_API_KEY");
    }

    console.log("Using saved API key for DeepSeek API call with enhanced request body");
    
    // Enhanced request body with better parameters for quality responses
    const enhancedRequestBody = {
      ...requestBody,
      temperature: 0.1, // Lower temperature for more consistent responses
      max_tokens: Math.min(requestBody.max_tokens || 4096, 8192), // Allow larger responses
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "IPA-System/1.0"
      },
      body: JSON.stringify(enhancedRequestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", response.status, errorData);
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }
    
    const responseData = await response.json();
    
    // Validate response structure
    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error("Invalid response structure from DeepSeek API");
    }
    
    return responseData;
  }

  static handleApiError(error: unknown, agent: string): void {
    console.error(`Error calling DeepSeek API for ${agent}:`, error);
    
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    toast({
      title: "API Error",
      description: `Failed to get response from ${agent}: ${errorMessage}`,
      variant: "destructive"
    });
  }

  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testRequest: DeepSeekCompletionRequest = {
        model: "deepseek-chat",
        messages: [
          { role: "user", content: "Test connection" }
        ],
        max_tokens: 10
      };

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testRequest)
      });

      return response.ok;
    } catch (error) {
      console.error("API key validation failed:", error);
      return false;
    }
  }
}
