
import React, { useState, useEffect } from "react";
import { SavedPrompt, promptService } from "@/services/api/promptService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Globe, 
  Lock,
  FileText,
  Tags,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PromptEditorProps {
  prompt?: SavedPrompt | null;
  onSave: () => void;
  onClose: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    prompt: '',
    tags: [] as string[],
    category: '',
    isPublic: false,
    rating: 0,
    usage: 0,
    author: '',
    notes: ''
  });
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (prompt) {
      setFormData({
        projectName: prompt.projectName || '',
        description: prompt.description || '',
        prompt: prompt.prompt || '',
        tags: prompt.tags || [],
        category: prompt.category || '',
        isPublic: prompt.isPublic || false,
        rating: prompt.rating || 0,
        usage: prompt.usage || 0,
        author: prompt.author || '',
        notes: prompt.notes || ''
      });
    } else {
      // Reset form for new prompt
      setFormData({
        projectName: '',
        description: '',
        prompt: '',
        tags: [],
        category: '',
        isPublic: false,
        rating: 0,
        usage: 0,
        author: '',
        notes: ''
      });
    }
  }, [prompt]);

  useEffect(() => {
    const words = formData.prompt.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(formData.prompt.length);
  }, [formData.prompt]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.projectName.trim() || !formData.prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name and prompt content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const promptData = {
        ...formData,
        projectName: formData.projectName.trim(),
        description: formData.description.trim(),
        prompt: formData.prompt.trim(),
        lastModified: Date.now()
      };

      if (prompt) {
        await promptService.updatePrompt(prompt.id, promptData);
        toast({
          title: "Success",
          description: "Prompt updated successfully!",
        });
      } else {
        await promptService.savePrompt(promptData);
        toast({
          title: "Success",
          description: "Prompt saved successfully!",
        });
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'testing', label: 'Testing' },
    { value: 'planning', label: 'Planning' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {prompt ? 'Edit Prompt' : 'Create New Prompt'}
              </CardTitle>
              <CardDescription>
                {prompt ? 'Modify and update your saved prompt' : 'Create a new prompt to save for future use'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : prompt ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isPreview ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{formData.projectName || 'Untitled Prompt'}</h3>
              {formData.description && (
                <p className="text-muted-foreground mb-4">{formData.description}</p>
              )}
            </div>
            
            <Separator />
            
            <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
              {formData.prompt || 'No prompt content...'}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              {wordCount} words • {charCount} characters
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set the name, description, and categorization for your prompt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="Enter a descriptive name for your prompt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Briefly describe what this prompt does or when to use it"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Author name (optional)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Content</CardTitle>
                <CardDescription>Write your prompt content and add relevant tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt Content *</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => handleInputChange('prompt', e.target.value)}
                    placeholder="Enter your prompt content here..."
                    rows={12}
                    className="font-mono"
                  />
                  <div className="text-sm text-muted-foreground">
                    {wordCount} words • {charCount} characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes or comments about this prompt"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure visibility, rating, and other prompt settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      {formData.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      Public Visibility
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make this prompt visible to other users in the community
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating: {formData.rating}/5
                  </Label>
                  <Slider
                    value={[formData.rating]}
                    onValueChange={(value) => handleInputChange('rating', value[0])}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Usage Count</Label>
                  <Input
                    type="number"
                    value={formData.usage}
                    onChange={(e) => handleInputChange('usage', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Track how many times this prompt has been used
                  </p>
                </div>

                {prompt && (
                  <div className="space-y-2">
                    <Label>Metadata</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Created: {new Date(prompt.timestamp).toLocaleString()}</p>
                      <p>Last Modified: {new Date(prompt.lastModified || prompt.timestamp).toLocaleString()}</p>
                      <p>Prompt ID: {prompt.id}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PromptEditor;
