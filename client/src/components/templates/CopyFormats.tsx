import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSpec } from "@/types/ipa-types";

interface CopyFormatsProps {
  template: {
    id: string;
    name: string;
    spec: ProjectSpec;
  };
}

const CopyFormats: React.FC<CopyFormatsProps> = ({ template }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(format);
      toast({
        title: "Copied!",
        description: `${template.name} copied in ${format} format`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatAsJson = () => JSON.stringify(template.spec, null, 2);
  
  const formatAsYaml = () => {
    const yamlString = Object.entries(template.spec)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');
    return yamlString;
  };

  const formatAsEnv = () => {
    return Object.entries(template.spec)
      .map(([key, value]) => {
        const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
        if (Array.isArray(value)) {
          return `${envKey}="${value.join(',')}"`;
        }
        return `${envKey}="${value}"`;
      })
      .join('\n');
  };

  const formatAsMarkdown = () => {
    return `# ${template.name}

## Project Description
${template.spec.projectDescription}

## Tech Stack

### Frontend
${template.spec.frontendTechStack.map(tech => `- ${tech}`).join('\n')}
${template.spec.customFrontendTech.length > 0 ? `\nCustom Frontend:\n${template.spec.customFrontendTech.map(tech => `- ${tech}`).join('\n')}` : ''}

### Backend
${template.spec.backendTechStack.map(tech => `- ${tech}`).join('\n')}
${template.spec.customBackendTech.length > 0 ? `\nCustom Backend:\n${template.spec.customBackendTech.map(tech => `- ${tech}`).join('\n')}` : ''}

## AI Features
- **RAG Vector DB**: ${template.spec.ragVectorDb}
- **MCP Type**: ${template.spec.mcpType}
- **A2A Integration**: ${template.spec.a2aIntegrationDetails}

## Additional Features
${template.spec.additionalFeatures}

## Advanced Prompt Details
${template.spec.advancedPromptDetails}

## Deployment
- **Platform**: ${template.spec.deploymentPreference}
- **Authentication**: ${template.spec.authenticationMethod}
`;
  };

  const formats = [
    {
      name: "JSON",
      description: "Standard JSON format for API usage",
      format: "json",
      content: formatAsJson(),
    },
    {
      name: "YAML",
      description: "Human-readable YAML format",
      format: "yaml", 
      content: formatAsYaml(),
    },
    {
      name: "Environment Variables",
      description: "Environment variable format",
      format: "env",
      content: formatAsEnv(),
    },
    {
      name: "Markdown",
      description: "Formatted documentation",
      format: "markdown",
      content: formatAsMarkdown(),
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings className="h-3 w-3" />
          Copy Options
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy {template.name} - Multiple Formats</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((format) => (
            <Card key={format.format}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm">{format.name}</CardTitle>
                    <CardDescription className="text-xs">{format.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(format.content, format.name)}
                    disabled={copied === format.name}
                  >
                    {copied === format.name ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={format.content}
                  readOnly
                  className="h-32 font-mono text-xs resize-none"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setIsOpen(false)} variant="outline">
            Close
          </Button>
          <Button onClick={() => copyToClipboard(formatAsJson(), "JSON")}>
            Quick Copy JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopyFormats;