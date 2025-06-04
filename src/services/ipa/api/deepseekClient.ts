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
    
    // Enhanced request body with support for deepseek-reasoner model
    const enhancedRequestBody = {
      ...requestBody,
      model: requestBody.model === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat",
      temperature: requestBody.model === "deepseek-reasoner" ? undefined : 0.1, // Not supported for reasoner
      max_tokens: Math.min(requestBody.max_tokens || 4096, requestBody.model === "deepseek-reasoner" ? 8192 : 8192),
      top_p: requestBody.model === "deepseek-reasoner" ? undefined : 0.95, // Not supported for reasoner
      frequency_penalty: requestBody.model === "deepseek-reasoner" ? undefined : 0.1, // Not supported for reasoner
      presence_penalty: requestBody.model === "deepseek-reasoner" ? undefined : 0.1, // Not supported for reasoner
      stream: false
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "IPA-System/2.0"
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

  static async makeReasonerCall(requestBody: DeepSeekCompletionRequest): Promise<{
    reasoning_content?: string;
    content: string;
    usage?: any;
  }> {
    const reasonerRequest = {
      ...requestBody,
      model: "deepseek-reasoner"
    };

    const response = await this.makeApiCall(reasonerRequest);
    const choice = response.choices[0];

    return {
      reasoning_content: choice.message.reasoning_content,
      content: choice.message.content,
      usage: response.usage
    };
  }

  static cleanMessagesForNextRound(messages: any[]): any[] {
    // Remove reasoning_content from messages to avoid 400 error
    return messages.map(msg => {
      if (msg.reasoning_content) {
        const { reasoning_content, ...cleanMsg } = msg;
        return cleanMsg;
      }
      return msg;
    });
  }
}
