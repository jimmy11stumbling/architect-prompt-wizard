
import React, { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  const handleDownload = () => {
    if (!prompt) return;
    
    const blob = new Blob([prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursor-prompt.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded prompt",
      description: "The Cursor prompt has been downloaded as a markdown file",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Generated Cursor Prompt</CardTitle>
          <CardDescription>
            Created using DeepSeek Reasoner model with Chain-of-Thought reasoning
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!prompt}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
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
        </div>
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

