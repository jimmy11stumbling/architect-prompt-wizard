
export class ApiKeyManager {
  static getApiKey(): string | null {
    // Check localStorage first (from ApiKeyForm)
    const storedKey = localStorage.getItem("deepseek_api_key");
    if (storedKey) {
      return storedKey;
    }
    
    // Check environment variable as fallback
    return import.meta.env.VITE_DEEPSEEK_API_KEY || null;
  }

  static setApiKey(apiKey: string): void {
    localStorage.setItem("deepseek_api_key", apiKey);
  }

  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }
}
