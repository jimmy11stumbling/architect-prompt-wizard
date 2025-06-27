
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const clearApiKey = () => {
    setApiKey("");
    localStorage.removeItem(DEEPSEEK_API_KEY_STORAGE);
    toast({
      title: "API Key Removed",
      description: "DeepSeek API key has been cleared.",
    });
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="flex items-center gap-2 mb-2">
        <Key className="h-5 w-5 text-ipa-primary" />
        <h3 className="text-lg font-medium">DeepSeek API Key</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-ipa-muted cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="w-80 p-3">
              <p>Your DeepSeek API key is stored locally in your browser and used to access the DeepSeek API for advanced AI reasoning capabilities.</p>
              <p className="mt-2">Visit <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-ipa-primary underline">DeepSeek Platform</a> to get your API key.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your DeepSeek API key to enable actual AI agent communication. Your key is stored locally in your browser.
      </p>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={isVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-ipa-muted hover:text-ipa-foreground"
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleSaveApiKey}
            className="flex-1"
          >
            Save API Key
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={clearApiKey}
          >
            Clear
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1 ${apiKey ? "bg-ipa-success" : "bg-ipa-muted"}`} />
        <p className="text-xs text-muted-foreground flex-1">
          {apiKey 
            ? "API key is set. The application will use your DeepSeek API key for agent communication." 
            : "No API key is provided. The application will use simulated responses for demonstration."}
        </p>
      </div>
    </div>
  );
};
