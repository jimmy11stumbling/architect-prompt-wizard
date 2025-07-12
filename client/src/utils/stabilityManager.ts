
class StabilityManager {
  private static instance: StabilityManager;
  private requestTimestamps = new Map<string, number>();
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between identical requests
  
  static getInstance(): StabilityManager {
    if (!StabilityManager.instance) {
      StabilityManager.instance = new StabilityManager();
    }
    return StabilityManager.instance;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const lastRequest = this.requestTimestamps.get(key) || 0;
    
    if (now - lastRequest < this.MIN_REQUEST_INTERVAL) {
      return false;
    }
    
    this.requestTimestamps.set(key, now);
    return true;
  }

  debounce<T extends any[]>(
    key: string,
    fn: (...args: T) => Promise<any>,
    delay: number = 300
  ): (...args: T) => Promise<any> {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: T): Promise<any> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            if (this.canMakeRequest(key)) {
              const result = await fn(...args);
              resolve(result);
            } else {
              reject(new Error('Request throttled'));
            }
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }

  clearCache(): void {
    this.requestTimestamps.clear();
  }
}

export default StabilityManager;
