
import React from "react";
import { SavedPrompt } from "@/services/db/supabasePromptService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, X, Plus, Globe, Lock } from "lucide-react";
import { usePromptEditor } from "./hooks/usePromptEditor";

interface PromptEditorProps {
  prompt?: SavedPrompt | null;
  onSave?: () => void;
  onClose?: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onClose }) => {
  const {
    formData,
    setFormData,
    newTag,
    setNewTag,
    newTech,
    setNewTech,
    isSaving,
    handleSave,
    addTag,
    removeTag,
    addTech,
    removeTech
  } = usePromptEditor(prompt, onSave, onClose);

  const categories = [
    { value: "web-apps", label: "Web Applications" },
    { value: "mobile-apps", label: "Mobile Apps" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "data-analytics", label: "Data Analytics" },
    { value: "automation", label: "Automation" },
    { value: "creative", label: "Creative Projects" }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {prompt ? "Edit Prompt" : "Create New Prompt"}
              {formData.isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </CardTitle>
            <CardDescription>
              {prompt ? "Update your existing prompt" : "Create a new prompt for your library"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Your name or username"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of what this prompt does"
            rows={3}
          />
        </div>

        {/* Prompt Content */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt Content *</Label>
          <Textarea
            id="prompt"
            value={formData.prompt || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="Enter your detailed prompt here..."
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <Separator />

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complexity">Complexity</Label>
            <Select
              value={formData.complexity || "beginner"}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                setFormData(prev => ({ ...prev, complexity: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time</Label>
            <Input
              id="estimatedTime"
              value={formData.estimatedTime || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
              placeholder="e.g., 30 minutes"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === "Enter" && addTag()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <Label>Tech Stack</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.techStack?.map((tech, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {tech}
                <button
                  onClick={() => removeTech(tech)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Add technology"
              onKeyPress={(e) => e.key === "Enter" && addTech()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTech}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label htmlFor="isPublic">Make Public</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Allow others to discover and use this prompt
            </p>
          </div>
          <Switch
            id="isPublic"
            checked={formData.isPublic || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Prompt"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptEditor;
