
import { ApiKeyManager } from './apiKeyManager';

export class DeepSeekApiClient {
  static async makeApiCall(messages: Array<{role: string, content: string}>): Promise<any> {
    const apiKey = ApiKeyManager.getApiKey();
    
    if (!apiKey) {
      console.warn("No DeepSeek API key found");
      throw new Error("No API key available");
    }

    console.log("Making DeepSeek API call with real API key");
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: messages,
        max_tokens: 4096,
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("DeepSeek API call successful");
    return result;
  }
}
