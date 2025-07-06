import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Zap, 
  Pause, 
  Play, 
  Square, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface StreamingResponseProps {
  isStreaming: boolean;
  response: string;
  reasoning: string;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  tokenCount?: number;
  estimatedTotal?: number;
}

const StreamingResponse: React.FC<StreamingResponseProps> = ({
  isStreaming,
  response,
  reasoning,
  onStop,
  onPause,
  onResume,
  isPaused = false,
  tokenCount = 0,
  estimatedTotal = 4096
}) => {
  const [showReasoning, setShowReasoning] = useState(true);
  const [responseHeight, setResponseHeight] = useState("auto");
  const responseRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom as new content streams in
  useEffect(() => {
    if (responseRef.current && isStreaming) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response, isStreaming]);

  useEffect(() => {
    if (reasoningRef.current && isStreaming && showReasoning) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [reasoning, isStreaming, showReasoning]);

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleCopyReasoning = async () => {
    try {
      await navigator.clipboard.writeText(reasoning);
      toast({
        title: "Copied!",
        description: "Reasoning copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const content = `# DeepSeek Reasoner Response\n\n## Response\n${response}\n\n## Reasoning Process\n${reasoning}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-response-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Response saved as Markdown file"
    });
  };

  const progress = estimatedTotal > 0 ? Math.min((tokenCount / estimatedTotal) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Streaming Controls */}
      {isStreaming && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardContent className="pt-4 bg-[#172133]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-sm font-medium">
                    {isPaused ? "Paused" : "Streaming"} DeepSeek Response
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  277 tokens
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {!isPaused ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onPause}
                    className="h-8"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onResume}
                    className="h-8"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={onStop}
                  className="h-8"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </div>
            </div>
            
            {estimatedTotal > 0 && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>277 tokens</span>
                  <span>6.8% complete</span>
                  <span>~{estimatedTotal} estimated</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Response Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Response
              {isStreaming && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse ml-2" />}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyResponse}
                disabled={!response}
                className="h-8"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                disabled={!response && !reasoning}
                className="h-8"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-64 w-full" ref={responseRef}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {response || (isStreaming ? "Generating response..." : "No response yet")}
              {isStreaming && <span className="animate-pulse">|</span>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Reasoning Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Chain-of-Thought Reasoning
              {isStreaming && reasoning && <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse ml-2" />}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowReasoning(!showReasoning)}
                className="h-8"
              >
                {showReasoning ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyReasoning}
                disabled={!reasoning}
                className="h-8"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showReasoning && (
          <CardContent>
            <ScrollArea className="h-64 w-full" ref={reasoningRef}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {reasoning || (isStreaming ? "Processing reasoning..." : "No reasoning available")}
                {isStreaming && reasoning && <span className="animate-pulse">|</span>}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default StreamingResponse;