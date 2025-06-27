import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSpec } from "@/types/ipa-types";

interface OneClickCopyProps {
  template: {
    id: string;
    name: string;
    spec: ProjectSpec;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const OneClickCopy: React.FC<OneClickCopyProps> = ({ 
  template, 
  variant = "outline", 
  size = "sm",
  className = ""
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const templateData = JSON.stringify(template.spec, null, 2);
      await navigator.clipboard.writeText(templateData);
      
      setCopied(true);
      toast({
        title: "Template Copied!",
        description: `${template.name} template data copied to clipboard`,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy template data to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={`gap-1 ${className}`}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy Template
        </>
      )}
    </Button>
  );
};

export default OneClickCopy;