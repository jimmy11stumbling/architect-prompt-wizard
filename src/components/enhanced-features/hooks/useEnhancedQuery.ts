
import { useState } from "react";
import { enhancedSystemService, EnhancedQuery, EnhancedResponse } from "@/services/integration/enhancedSystemService";

export const useEnhancedQuery = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<EnhancedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useRag, setUseRag] = useState(true);
  const [useA2A, setUseA2A] = useState(true);
  const [useMCP, setUseMCP] = useState(true);
  const [realTimeLog, setRealTimeLog] = useState<string[]>([]);

  const executeEnhancedQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setProgress(0);
    setResponse(null);
    setRealTimeLog([]);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 300);

    try {
      const enhancedQuery: EnhancedQuery = {
        query,
        useRag,
        useA2A,
        useMCP,
        conversationId: response?.conversationId
      };

      console.log("Executing enhanced query:", enhancedQuery);
      const result = await enhancedSystemService.processEnhancedQuery(enhancedQuery);
      console.log("Enhanced query result:", result);
      
      setResponse(result);
      setRealTimeLog(result.processingLog);
      setProgress(100);
    } catch (error) {
      console.error("Enhanced query failed:", error);
      const errorLog = [`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`];
      setRealTimeLog(errorLog);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setLoading(false), 500);
    }
  };

  const clearSession = () => {
    setQuery("");
    setResponse(null);
    setRealTimeLog([]);
    setProgress(0);
  };

  return {
    query,
    setQuery,
    response,
    loading,
    progress,
    useRag,
    setUseRag,
    useA2A,
    setUseA2A,
    useMCP,
    setUseMCP,
    realTimeLog,
    executeEnhancedQuery,
    clearSession
  };
};
