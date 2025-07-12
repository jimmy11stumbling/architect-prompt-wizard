import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Slider component removed - using simple range input
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Settings, Database, Network, Bot } from 'lucide-react';

interface StreamingControlsProps {
  isStreaming: boolean;
  ragEnabled: boolean;
  setRagEnabled: (enabled: boolean) => void;
  mcpEnabled: boolean;
  setMcpEnabled: (enabled: boolean) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  ragStats?: any;
  mcpStats?: any;
}

export function StreamingControls({
  isStreaming,
  ragEnabled,
  setRagEnabled,
  mcpEnabled,
  setMcpEnabled,
  temperature,
  setTemperature,
  demoMode,
  setDemoMode,
  onPause,
  onResume,
  onStop,
  ragStats,
  mcpStats
}: StreamingControlsProps) {
  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Settings className="h-4 w-4" />
          Streaming Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streaming Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPause}
            disabled={!isStreaming}
            className="flex items-center gap-1"
          >
            <Pause className="h-3 w-3" />
            Pause
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onResume}
            disabled={!isStreaming}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            Resume
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onStop}
            disabled={!isStreaming}
            className="flex items-center gap-1"
          >
            <Square className="h-3 w-3" />
            Stop
          </Button>
        </div>

        {/* Integration Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="rag-enabled"
                checked={ragEnabled}
                onCheckedChange={setRagEnabled}
                disabled={isStreaming}
              />
              <Label htmlFor="rag-enabled" className="flex items-center gap-1 text-sm">
                <Database className="h-4 w-4" />
                RAG 2.0
              </Label>
            </div>
            {ragStats && (
              <Badge variant="outline" className="text-xs">
                {ragStats.documentsIndexed} docs
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="mcp-enabled"
                checked={mcpEnabled}
                onCheckedChange={setMcpEnabled}
                disabled={isStreaming}
              />
              <Label htmlFor="mcp-enabled" className="flex items-center gap-1 text-sm">
                <Network className="h-4 w-4" />
                MCP Hub
              </Label>
            </div>
            {mcpStats && (
              <Badge variant="outline" className="text-xs">
                {mcpStats.totalAssets} assets
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={setDemoMode}
                disabled={isStreaming}
              />
              <Label htmlFor="demo-mode" className="flex items-center gap-1 text-sm">
                <Bot className="h-4 w-4" />
                Demo Mode
              </Label>
            </div>
            <Badge variant={demoMode ? "default" : "outline"} className="text-xs">
              {demoMode ? "Demo" : "Live"}
            </Badge>
          </div>
        </div>

        {/* Temperature Control */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center justify-between">
            <span>Temperature</span>
            <span className="text-xs text-gray-400">{temperature.toFixed(1)}</span>
          </Label>
          <input
            type="range"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            min={0}
            max={2}
            step={0.1}
            disabled={isStreaming}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StreamingControls;