
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Shield, 
  Zap, 
  Bell, 
  Palette, 
  Code, 
  Network,
  Save,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdvancedSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    // System Configuration
    defaultModel: "deepseek-v3",
    maxTokens: 4096,
    temperature: 0.7,
    enableRagByDefault: true,
    enableA2AByDefault: true,
    enableMcpByDefault: true,
    
    // Performance Settings
    maxConcurrentAgents: 5,
    requestTimeout: 30000,
    cacheEnabled: true,
    backgroundProcessing: true,
    
    // Security Settings
    apiKeyEncryption: true,
    auditLogging: true,
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
    completionNotifications: true,
    
    // UI/UX Settings
    darkMode: true,
    compactMode: false,
    showAdvancedOptions: true,
    autoSaveInterval: 30,
    
    // Development Settings
    debugMode: false,
    verboseLogging: false,
    enableExperimentalFeatures: false,
    
    // Integration Settings
    autoBackup: true,
    backupInterval: 24,
    syncSettings: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [savedSettings, setSavedSettings] = useState(settings);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('advancedSettings');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSettings(parsed);
        setSavedSettings(parsed);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem('advancedSettings', JSON.stringify(settings));
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1'
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        setSavedSettings(settings);
        setHasChanges(false);
        toast({
          title: "Settings Saved",
          description: "Your advanced settings have been saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Settings cached locally but server sync failed",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      defaultModel: "deepseek-v3",
      maxTokens: 4096,
      temperature: 0.7,
      enableRagByDefault: true,
      enableA2AByDefault: true,
      enableMcpByDefault: true,
      maxConcurrentAgents: 5,
      requestTimeout: 30000,
      cacheEnabled: true,
      backgroundProcessing: true,
      apiKeyEncryption: true,
      auditLogging: true,
      rateLimitEnabled: true,
      maxRequestsPerMinute: 100,
      emailNotifications: true,
      pushNotifications: false,
      systemAlerts: true,
      completionNotifications: true,
      darkMode: true,
      compactMode: false,
      showAdvancedOptions: true,
      autoSaveInterval: 30,
      debugMode: false,
      verboseLogging: false,
      enableExperimentalFeatures: false,
      autoBackup: true,
      backupInterval: 24,
      syncSettings: true
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  // Apply dark mode immediately when changed
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);



  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Advanced Settings
          </h1>
          <p className="text-slate-400 mt-1">Configure system behavior and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-300 border-yellow-400/30">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveSettings} 
            className="btn-nocodelos"
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default AI Model</Label>
                  <select
                    id="defaultModel"
                    value={settings.defaultModel}
                    onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md"
                  >
                    <option value="deepseek-v3">DeepSeek v3</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                    min="1024"
                    max="8192"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Service Enablement</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableRag">Enable RAG 2.0</Label>
                    <Switch
                      id="enableRag"
                      checked={settings.enableRagByDefault}
                      onCheckedChange={(checked) => handleSettingChange('enableRagByDefault', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableA2A">Enable A2A</Label>
                    <Switch
                      id="enableA2A"
                      checked={settings.enableA2AByDefault}
                      onCheckedChange={(checked) => handleSettingChange('enableA2AByDefault', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableMcp">Enable MCP</Label>
                    <Switch
                      id="enableMcp"
                      checked={settings.enableMcpByDefault}
                      onCheckedChange={(checked) => handleSettingChange('enableMcpByDefault', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAgents">Max Concurrent Agents</Label>
                  <Input
                    id="maxAgents"
                    type="number"
                    value={settings.maxConcurrentAgents}
                    onChange={(e) => handleSettingChange('maxConcurrentAgents', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.requestTimeout}
                    onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value))}
                    min="5000"
                    max="60000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Caching</Label>
                    <p className="text-sm text-slate-400">Cache responses for faster retrieval</p>
                  </div>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Background Processing</Label>
                    <p className="text-sm text-slate-400">Process tasks in the background</p>
                  </div>
                  <Switch
                    checked={settings.backgroundProcessing}
                    onCheckedChange={(checked) => handleSettingChange('backgroundProcessing', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Key Encryption</Label>
                    <p className="text-sm text-slate-400">Encrypt stored API keys</p>
                  </div>
                  <Switch
                    checked={settings.apiKeyEncryption}
                    onCheckedChange={(checked) => handleSettingChange('apiKeyEncryption', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-slate-400">Log all system activities</p>
                  </div>
                  <Switch
                    checked={settings.auditLogging}
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-slate-400">Limit API requests per minute</p>
                  </div>
                  <Switch
                    checked={settings.rateLimitEnabled}
                    onCheckedChange={(checked) => handleSettingChange('rateLimitEnabled', checked)}
                  />
                </div>
              </div>

              {settings.rateLimitEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Max Requests per Minute</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={settings.maxRequestsPerMinute}
                    onChange={(e) => handleSettingChange('maxRequestsPerMinute', parseInt(e.target.value))}
                    min="10"
                    max="1000"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-slate-400">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-slate-400">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Completion Notifications</Label>
                    <p className="text-sm text-slate-400">Notify when tasks complete</p>
                  </div>
                  <Switch
                    checked={settings.completionNotifications}
                    onCheckedChange={(checked) => handleSettingChange('completionNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                User Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-slate-400">Use dark theme</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-slate-400">Reduce spacing and padding</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Advanced Options</Label>
                    <p className="text-sm text-slate-400">Display advanced settings</p>
                  </div>
                  <Switch
                    checked={settings.showAdvancedOptions}
                    onCheckedChange={(checked) => handleSettingChange('showAdvancedOptions', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoSave">Auto-save Interval (seconds)</Label>
                <Input
                  id="autoSave"
                  type="number"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                  min="10"
                  max="300"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <Card className="card-nocodelos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Development Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-md p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-yellow-200 mt-1">
                  These settings are for development purposes only. Enable with caution in production.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-slate-400">Enable debug information</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verbose Logging</Label>
                    <p className="text-sm text-slate-400">Detailed system logs</p>
                  </div>
                  <Switch
                    checked={settings.verboseLogging}
                    onCheckedChange={(checked) => handleSettingChange('verboseLogging', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Experimental Features</Label>
                    <p className="text-sm text-slate-400">Enable beta features</p>
                  </div>
                  <Switch
                    checked={settings.enableExperimentalFeatures}
                    onCheckedChange={(checked) => handleSettingChange('enableExperimentalFeatures', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSettingsPage;
