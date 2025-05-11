
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PromptOutputProps {
  prompt: string | undefined;
}

const PromptOutput: React.FC<PromptOutputProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The Cursor prompt has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Cursor Prompt</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!prompt}
          className="gap-1"
        >
          {copied ? (
            <Check className="h-4 w-4 text-ipa-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        {prompt ? (
          <pre className="bg-ipa-background border border-ipa-border rounded-md p-4 overflow-auto max-h-[500px] text-sm whitespace-pre-wrap">
            {prompt}
          </pre>
        ) : (
          <div className="h-[300px] flex items-center justify-center border border-dashed border-ipa-border rounded-md">
            <p className="text-ipa-muted">The generated prompt will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptOutput;
