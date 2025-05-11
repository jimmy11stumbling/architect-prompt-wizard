
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Define local storage key
const DEEPSEEK_API_KEY_STORAGE = "deepseek_api_key";

export const getDeepSeekApiKey = (): string => {
  return localStorage.getItem(DEEPSEEK_API_KEY_STORAGE) || "";
};

export const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load the saved API key from localStorage on component mount
    const savedKey = localStorage.getItem(DEEPSEEK_API_KEY_STORAGE);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(DEEPSEEK_API_KEY_STORAGE, apiKey.trim());
    toast({
      title: "Success",
      description: "DeepSeek API key saved successfully.",
    });
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-lg font-medium mb-2">DeepSeek API Key</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your DeepSeek API key to enable actual API calls. Your key is stored locally in your browser.
      </p>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your DeepSeek API key"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={toggleVisibility}
              size="icon"
            >
              {isVisible ? "🙈" : "👁️"}
            </Button>
          </div>
        </div>
        <Button type="button" onClick={handleSaveApiKey}>
          Save API Key
        </Button>
      </div>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground">
        If no API key is provided, the application will use simulated responses for demonstration.
      </p>
    </div>
  );
};
