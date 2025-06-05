
interface BatchRequest<T> {
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RequestBatcher {
  private batches: Map<string, BatchRequest<any>[]> = new Map();
  private processing: Set<string> = new Set();

  async addRequest<T>(batchKey: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }
      
      this.batches.get(batchKey)!.push({ resolve, reject });
      
      // Process batch if not already processing
      if (!this.processing.has(batchKey)) {
        this.processBatch(batchKey, requestFn);
      }
    });
  }

  private async processBatch<T>(batchKey: string, requestFn: () => Promise<T>): Promise<void> {
    this.processing.add(batchKey);
    
    try {
      const result = await requestFn();
      const requests = this.batches.get(batchKey) || [];
      
      // Resolve all requests in the batch with the same result
      requests.forEach(request => request.resolve(result));
      
      console.log(`📦 Batch processed: ${batchKey} (${requests.length} requests)`);
    } catch (error) {
      const requests = this.batches.get(batchKey) || [];
      requests.forEach(request => request.reject(error));
      
      console.error(`📦 Batch failed: ${batchKey}`, error);
    } finally {
      this.batches.delete(batchKey);
      this.processing.delete(batchKey);
    }
  }
}

export const requestBatcher = new RequestBatcher();
