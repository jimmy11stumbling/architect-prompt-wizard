import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface StreamingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamingOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onReasoningToken?: (token: string) => void;
  onComplete?: (fullResponse: string, reasoning?: string) => void;
  onError?: (error: Error) => void;
}

export class DeepSeekStreamingClient {
  private static readonly API_URL = "https://api.deepseek.com/v1/chat/completions";
  private static readonly REASONER_MODEL = "deepseek-reasoner";

  static async streamChatResponse(
    messages: StreamingMessage[],
    options: StreamingOptions = {}
  ): Promise<void> {
    const apiKey = localStorage.getItem("deepseek_api_key");

    if (!apiKey) {
      const error = new Error("DeepSeek API key is required for streaming");
      options.onError?.(error);
      throw error;
    }

    realTimeResponseService.addResponse({
      source: "deepseek-streaming",
      status: "processing",
      message: "Initiating streaming connection to DeepSeek",
      data: { 
        model: options.model || this.REASONER_MODEL,
        messageCount: messages.length,
        streaming: true
      }
    });

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options.model || this.REASONER_MODEL,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullResponse = "";
      let fullReasoning = "";

      // Throttling mechanism to reduce UI jumping
      let lastUpdateTime = 0;
      const UPDATE_THROTTLE_MS = 50; // Minimum 50ms between UI updates

      realTimeResponseService.addResponse({
        source: "deepseek-streaming",
        status: "streaming",
        message: "Stream connected, receiving tokens...",
        data: { streamStarted: true }
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith("data:")) {
            const jsonStr = part.slice(5).trim();
            if (jsonStr === "[DONE]") {
              options.onComplete?.(fullResponse, fullReasoning);
              realTimeResponseService.addResponse({
                source: "deepseek-streaming",
                status: "success",
                message: "Streaming completed successfully",
                data: { 
                  totalTokens: fullResponse.length + fullReasoning.length,
                  responseLength: fullResponse.length,
                  reasoningLength: fullReasoning.length
                }
              });
              return;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const choice = parsed.choices?.[0];

              if (choice?.delta) {
                const now = Date.now();

                // Handle main content tokens
                const contentToken = choice.delta.content;
                if (contentToken) {
                  // Ensure proper spacing between tokens
                  if (fullResponse && !fullResponse.endsWith(' ') && 
                      !contentToken.startsWith(' ') && !contentToken.match(/^[.,!?;:]/)) {
                    fullResponse += ' ';
                  }
                  fullResponse += contentToken;

                  // Throttle UI updates to prevent jumping
                  if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
                    options.onToken?.(contentToken);
                    lastUpdateTime = now;
                  }
                }

                // Handle reasoning tokens (if available)
                const reasoningToken = choice.delta.reasoning_content;
                if (reasoningToken) {
                  // Ensure proper spacing for reasoning tokens too
                  if (fullReasoning && !fullReasoning.endsWith(' ') && 
                      !reasoningToken.startsWith(' ') && !reasoningToken.match(/^[.,!?;:]/)) {
                    fullReasoning += ' ';
                  }
                  fullReasoning += reasoningToken;

                  // Throttle UI updates to prevent jumping
                  if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
                    options.onReasoningToken?.(reasoningToken);
                    lastUpdateTime = now;
                  }
                }
              }
            } catch (e) {
              console.warn("JSON parse error in stream:", e);
            }
          }
        }
        buffer = parts[parts.length - 1];
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown streaming error");

      realTimeResponseService.addResponse({
        source: "deepseek-streaming",
        status: "error",
        message: `Streaming failed: ${err.message}`,
        data: { error: err.message }
      });

      options.onError?.(err);
      throw err;
    }
  }

  static async streamReasonerResponse(
    messages: StreamingMessage[],
    options: Omit<StreamingOptions, 'model'> = {}
  ): Promise<void> {
    return this.streamChatResponse(messages, {
      ...options,
      model: this.REASONER_MODEL
    });
  }
}