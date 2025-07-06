import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Database, Bot, Palette, Zap, Shield, Globe } from "lucide-react";

interface SettingsConfig {
  // AI Settings
  aiModel: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
  
  // RAG Settings
  ragEnabled: boolean;
  vectorDb: string;
  embeddingModel: string;
  chunkSize: number;
  overlapSize: number;
  
  // MCP Settings
  mcpEnabled: boolean;
  mcpServers: string[];
  mcpTimeout: number;
  
  // A2A Settings
  a2aEnabled: boolean;
  agentConcurrency: number;
  agentTimeout: number;
  
  // UI Settings
  theme: string;
  animationsEnabled: boolean;
  compactMode: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsConfig>({
    // AI Settings
    aiModel: "deepseek",
    temperature: 0.7,
    maxTokens: 4000,
    streamingEnabled: true,
    
    // RAG Settings
    ragEnabled: true,
    vectorDb: "pgvector",
    embeddingModel: "tf-idf",
    chunkSize: 500,
    overlapSize: 50,
    
    // MCP Settings
    mcpEnabled: true,
    mcpServers: ["filesystem", "web", "database"],
    mcpTimeout: 30000,
    
    // A2A Settings
    a2aEnabled: true,
    agentConcurrency: 3,
    agentTimeout: 60000,
    
    // UI Settings
    theme: "dark",
    animationsEnabled: true,
    compactMode: false
  });

  const saveSettings = () => {
    localStorage.setItem("ipa-settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully."
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ai">AI Model</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="a2a">A2A</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model settings for generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={settings.aiModel}
                  onValueChange={(value) => setSettings({...settings, aiModel: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek Reasoner</SelectItem>
                    <SelectItem value="gpt4">GPT-4</SelectItem>
                    <SelectItem value="claude">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperature: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => setSettings({...settings, temperature: value})}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Tokens: {settings.maxTokens}</Label>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={([value]) => setSettings({...settings, maxTokens: value})}
                  min={1000}
                  max={8000}
                  step={100}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Streaming</Label>
                <Switch
                  checked={settings.streamingEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, streamingEnabled: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                RAG Configuration
              </CardTitle>
              <CardDescription>
                Configure Retrieval-Augmented Generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable RAG</Label>
                <Switch
                  checked={settings.ragEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, ragEnabled: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label>Vector Database</Label>
                <Select
                  value={settings.vectorDb}
                  onValueChange={(value) => setSettings({...settings, vectorDb: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pgvector">PostgreSQL + pgvector</SelectItem>
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                    <SelectItem value="chroma">Chroma</SelectItem>
                    <SelectItem value="qdrant">Qdrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chunk Size: {settings.chunkSize}</Label>
                <Slider
                  value={[settings.chunkSize]}
                  onValueChange={([value]) => setSettings({...settings, chunkSize: value})}
                  min={100}
                  max={1000}
                  step={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Overlap Size: {settings.overlapSize}</Label>
                <Slider
                  value={[settings.overlapSize]}
                  onValueChange={([value]) => setSettings({...settings, overlapSize: value})}
                  min={0}
                  max={200}
                  step={10}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                MCP Configuration
              </CardTitle>
              <CardDescription>
                Configure Model Context Protocol settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable MCP</Label>
                <Switch
                  checked={settings.mcpEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, mcpEnabled: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label>MCP Timeout (ms): {settings.mcpTimeout}</Label>
                <Slider
                  value={[settings.mcpTimeout]}
                  onValueChange={([value]) => setSettings({...settings, mcpTimeout: value})}
                  min={5000}
                  max={60000}
                  step={1000}
                />
              </div>

              <div className="space-y-2">
                <Label>Active MCP Servers</Label>
                <div className="space-y-2">
                  {["filesystem", "web", "database", "api", "tools"].map(server => (
                    <div key={server} className="flex items-center justify-between">
                      <Label className="text-sm">{server}</Label>
                      <Switch
                        checked={settings.mcpServers.includes(server)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSettings({...settings, mcpServers: [...settings.mcpServers, server]});
                          } else {
                            setSettings({...settings, mcpServers: settings.mcpServers.filter(s => s !== server)});
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a2a">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Agent-to-Agent Configuration
              </CardTitle>
              <CardDescription>
                Configure agent communication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable A2A Communication</Label>
                <Switch
                  checked={settings.a2aEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, a2aEnabled: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label>Agent Concurrency: {settings.agentConcurrency}</Label>
                <Slider
                  value={[settings.agentConcurrency]}
                  onValueChange={([value]) => setSettings({...settings, agentConcurrency: value})}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Agent Timeout (ms): {settings.agentTimeout}</Label>
                <Slider
                  value={[settings.agentTimeout]}
                  onValueChange={([value]) => setSettings({...settings, agentTimeout: value})}
                  min={10000}
                  max={300000}
                  step={5000}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Interface Settings
              </CardTitle>
              <CardDescription>
                Customize the user interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({...settings, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Animations</Label>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, animationsEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Compact Mode</Label>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings({...settings, compactMode: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Export Settings
                </Button>
                <Button variant="outline" className="w-full">
                  Import Settings
                </Button>
                <Button variant="outline" className="w-full text-destructive">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={saveSettings} size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}