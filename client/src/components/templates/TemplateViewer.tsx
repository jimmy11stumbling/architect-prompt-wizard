import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSpec } from "@/types/ipa-types";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  spec: ProjectSpec;
  tags: string[];
}

interface TemplateViewerProps {
  template: Template;
  onSelectTemplate: (spec: ProjectSpec) => void;
}

const TemplateViewer: React.FC<TemplateViewerProps> = ({ template, onSelectTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Template data has been copied to your clipboard",
      });
    });
  };

  const formatSpecForDisplay = (spec: ProjectSpec) => {
    return JSON.stringify(spec, null, 2);
  };

  const handleUseTemplate = () => {
    onSelectTemplate(template.spec);
    setIsOpen(false);
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied to the form`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Eye className="h-3 w-3" />
          View Full Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.icon}
            {template.name} - Complete Template
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{template.spec.projectDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Frontend:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.spec.frontendTechStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Backend:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.spec.backendTechStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">RAG Vector DB:</p>
                  <Badge variant="outline">{template.spec.ragVectorDb}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">MCP Type:</p>
                  <Badge variant="outline">{template.spec.mcpType}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">A2A Integration:</p>
                  <p className="text-xs">{template.spec.a2aIntegrationDetails}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Additional Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs">{template.spec.additionalFeatures}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Complete Template JSON</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formatSpecForDisplay(template.spec))}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formatSpecForDisplay(template.spec)}
                readOnly
                className="h-64 font-mono text-xs"
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleUseTemplate} className="flex-1">
              Use This Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(formatSpecForDisplay(template.spec))}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Template Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateViewer;