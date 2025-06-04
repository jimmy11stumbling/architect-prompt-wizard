
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, MessageSquare, Code } from "lucide-react";
import { DeepSeekClient } from "@/services/ipa/api/deepseekClient";
import { DeepSeekCompletionRequest } from "@/types/ipa-types";

const DeepSeekReasonerPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<any>(null);

  const handleReasonerQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const request: DeepSeekCompletionRequest = {
        model: "deepseek-reasoner",
        messages: [
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 4096
      };

      const result = await DeepSeekClient.makeReasonerCall(request);
      setResponse(result.content);
      setReasoning(result.reasoning_content || "");
      setTokenUsage(result.usage);
    } catch (error) {
      console.error("DeepSeek Reasoner error:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setQuery("");
    setResponse("");
    setReasoning("");
    setTokenUsage(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            DeepSeek Reasoner Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your complex reasoning query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleReasonerQuery}
              disabled={loading || !query.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Process with Reasoner
            </Button>
            <Button variant="outline" onClick={clearSession}>
              Clear
            </Button>
          </div>

          {tokenUsage && (
            <div className="flex gap-2 text-sm">
              <Badge variant="outline">
                Input: {tokenUsage.prompt_tokens} tokens
              </Badge>
              <Badge variant="outline">
                Output: {tokenUsage.completion_tokens} tokens
              </Badge>
              {tokenUsage.reasoning_tokens && (
                <Badge variant="outline">
                  Reasoning: {tokenUsage.reasoning_tokens} tokens
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(response || reasoning) && (
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Final Response
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Chain of Thought
            </TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                    {response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasoning">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chain of Thought Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
                    {reasoning || "No reasoning content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DeepSeekReasonerPanel;
