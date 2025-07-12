
export class ApiKeyManager {
  static getApiKey(): string | null {
    // Check localStorage first (from ApiKeyForm)
    const storedKey = localStorage.getItem("deepseek_api_key");
    if (storedKey) {
      return storedKey;
    }
    
    // For server-side API key, we'll use a server endpoint
    return null; // Client-side shouldn't access server environment variables directly
  }

  static setApiKey(apiKey: string): void {
    localStorage.setItem("deepseek_api_key", apiKey);
  }

  static hasApiKey(): boolean {
    // Always return true since we have server-side API key
    return true;
  }

  static async hasServerApiKey(): Promise<boolean> {
    try {
      const response = await fetch('/api/deepseek/check-api-key');
      const result = await response.json();
      return result.hasApiKey;
    } catch (error) {
      console.error('Error checking server API key:', error);
      return false;
    }
  }
}
