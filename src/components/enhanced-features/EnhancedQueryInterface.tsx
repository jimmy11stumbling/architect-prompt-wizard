
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Code, FileText, Network } from "lucide-react";
import { useEnhancedQuery } from "./hooks/useEnhancedQuery";
import QueryInterface from "./components/QueryInterface";
import RealTimeResponseMonitor from "./RealTimeResponseMonitor";
import ResponseTabs from "./components/ResponseTabs";

const EnhancedQueryInterface: React.FC = () => {
  const {
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
    executeEnhancedQuery,
    clearSession
  } = useEnhancedQuery();

  return (
    <div className="space-y-6">
      <QueryInterface
        query={query}
        setQuery={setQuery}
        loading={loading}
        progress={progress}
        useRag={useRag}
        setUseRag={setUseRag}
        useA2A={useA2A}
        setUseA2A={setUseA2A}
        useMCP={useMCP}
        setUseMCP={setUseMCP}
        onExecute={executeEnhancedQuery}
        onClear={clearSession}
      />

      <RealTimeResponseMonitor />

      {response && <ResponseTabs response={response} />}
    </div>
  );
};

export default EnhancedQueryInterface;
