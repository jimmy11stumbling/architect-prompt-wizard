
// Request batching system to reduce API calls under high load
interface BatchedRequest {
  id: string;
  request: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RequestBatcher {
  private batches: Map<string, BatchedRequest[]> = new Map();
  private batchTimeout: number = 100; // 100ms batch window
  private maxBatchSize: number = 50;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async addRequest(batchKey: string, request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const batchedRequest: BatchedRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        request,
        resolve,
        reject,
        timestamp: Date.now()
      };

      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      const batch = this.batches.get(batchKey)!;
      batch.push(batchedRequest);

      // Process batch if it reaches max size
      if (batch.length >= this.maxBatchSize) {
        this.processBatch(batchKey);
      } else {
        // Set timer for batch processing
        if (!this.timers.has(batchKey)) {
          const timer = setTimeout(() => {
            this.processBatch(batchKey);
          }, this.batchTimeout);
          this.timers.set(batchKey, timer);
        }
      }
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear timer
    const timer = this.timers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(batchKey);
    }

    // Remove batch from queue
    this.batches.delete(batchKey);

    try {
      // Process all requests in the batch
      const results = await Promise.allSettled(
        batch.map(req => this.executeRequest(req.request))
      );

      // Resolve individual promises
      results.forEach((result, index) => {
        const batchedRequest = batch[index];
        if (result.status === 'fulfilled') {
          batchedRequest.resolve(result.value);
        } else {
          batchedRequest.reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all requests in case of batch failure
      batch.forEach(req => req.reject(error));
    }
  }

  private async executeRequest(request: any): Promise<any> {
    // This would be replaced with actual API call logic
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate API delay
    return { success: true, data: request };
  }

  getBatchStats() {
    const totalPendingRequests = Array.from(this.batches.values())
      .reduce((sum, batch) => sum + batch.length, 0);
    
    return {
      activeBatches: this.batches.size,
      pendingRequests: totalPendingRequests,
      averageBatchSize: this.batches.size > 0 ? totalPendingRequests / this.batches.size : 0
    };
  }
}

export const requestBatcher = new RequestBatcher();
