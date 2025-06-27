import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSpec } from "@/types/ipa-types";

interface TemplateApplicatorProps {
  onApplyTemplate: (spec: ProjectSpec) => void;
}

const TemplateApplicator: React.FC<TemplateApplicatorProps> = ({ onApplyTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();

  const handleApplyJson = () => {
    try {
      const parsedSpec = JSON.parse(jsonInput);
      
      // Validate that it has the required ProjectSpec structure
      const requiredFields = ['projectDescription', 'frontendTechStack', 'backendTechStack'];
      const hasRequiredFields = requiredFields.every(field => parsedSpec.hasOwnProperty(field));
      
      if (!hasRequiredFields) {
        toast({
          title: "Invalid Template",
          description: "The JSON doesn't contain required ProjectSpec fields",
          variant: "destructive",
        });
        return;
      }

      onApplyTemplate(parsedSpec as ProjectSpec);
      setApplied(true);
      
      toast({
        title: "Template Applied Successfully!",
        description: "Your custom template has been loaded into the form",
      });

      setTimeout(() => {
        setApplied(false);
        setIsOpen(false);
        setJsonInput("");
      }, 1500);

    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format and try again",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid JSON file",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Apply Custom Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Custom Template</DialogTitle>
          <DialogDescription>
            Import and apply custom project templates from JSON files or by pasting template data directly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Method 1: Paste JSON</CardTitle>
              <CardDescription>
                Paste your template JSON directly (from one-click copy or manual creation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='Paste your ProjectSpec JSON here...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="h-32 font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Method 2: Upload JSON File</CardTitle>
              <CardDescription>
                Upload a .json file containing your template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="file:bg-muted file:border-0 file:text-xs"
                />
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="h-3 w-3 mr-1" />
                    Browse
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyJson}
              disabled={!jsonInput.trim() || applied}
            >
              {applied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Applied!
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Apply Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateApplicator;